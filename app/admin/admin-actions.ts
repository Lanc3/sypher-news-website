"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AdSlot, ArticleStatus } from "@prisma/client";
import { isReservedArticleSlug } from "@/lib/reserved-slugs";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

function revalidateArticlePaths(categorySlug: string, articleSlug: string) {
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${categorySlug}`);
  revalidatePath(`/news/${categorySlug}/${articleSlug}`);
  revalidatePath("/search");
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/analytics");
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

async function upsertPrimaryAuthor(input: {
  articleId: number;
  authorName?: string | null;
  authorSlug?: string | null;
  authorTitle?: string | null;
  authorBio?: string | null;
}) {
  const authorName = input.authorName?.trim();
  const authorSlug = normalizeSlug(input.authorSlug?.trim() || authorName || "");

  await prisma.articleAuthor.deleteMany({ where: { articleId: input.articleId } });

  if (!authorName || !authorSlug) return;

  const author = await prisma.author.upsert({
    where: { slug: authorSlug },
    create: {
      slug: authorSlug,
      name: authorName,
      title: input.authorTitle?.trim() || null,
      bio: input.authorBio?.trim() || null,
    },
    update: {
      name: authorName,
      title: input.authorTitle?.trim() || null,
      bio: input.authorBio?.trim() || null,
    },
  });

  await prisma.articleAuthor.create({
    data: { articleId: input.articleId, authorId: author.id, position: 0 },
  });
}

export async function deleteArticleFormAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await deleteArticleAction(id);
}

export async function deleteArticleAction(id: number) {
  await requireUser();
  const art = await prisma.article.findUnique({
    where: { id },
    include: { topic: { include: { category: true } } },
  });
  if (!art) return { ok: false as const, error: "Not found" };
  const categorySlug = art.topic.category.slug;
  const articleSlug = art.slug;
  const topicId = art.topicId;

  await prisma.$transaction(async (tx) => {
    await tx.article.delete({ where: { id } });
    const remaining = await tx.article.count({ where: { topicId } });
    if (remaining === 0) {
      await tx.topic.delete({ where: { id: topicId } });
    }
  });

  revalidateArticlePaths(categorySlug, articleSlug);
  return { ok: true as const };
}

const placementUpdateSchema = z.object({
  slot: z.enum(["header", "sidebar", "in_article"]),
  enabled: z.boolean(),
  adUnitPath: z.string().max(512).optional().nullable(),
  providerKey: z.string().max(512).optional().nullable(),
  adClient: z.string().max(255).optional().nullable(),
  slotId: z.string().max(255).optional().nullable(),
  format: z.string().max(64).optional().nullable(),
  layoutKey: z.string().max(255).optional().nullable(),
  targetPath: z.string().max(512).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export async function updateAdPlacementAction(raw: z.infer<typeof placementUpdateSchema>) {
  await requireUser();
  const parsed = placementUpdateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid" };
  const { slot, enabled, adUnitPath, providerKey, adClient, slotId, format, layoutKey, targetPath, notes } = parsed.data;
  if (enabled && (!adClient?.trim() || !slotId?.trim())) {
    return { ok: false as const, error: "Enabled slots require an AdSense client and slot ID." };
  }
  await prisma.adPlacement.update({
    where: { slot: slot as AdSlot },
    data: {
      enabled,
      adUnitPath: adUnitPath?.trim() || null,
      providerKey: providerKey?.trim() || null,
      adClient: adClient?.trim() || null,
      slotId: slotId?.trim() || null,
      format: format?.trim() || "auto",
      layoutKey: layoutKey?.trim() || null,
      targetPath: targetPath?.trim() || null,
      notes: notes?.trim() || null,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/ads");
  return { ok: true as const };
}

const articleSaveSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string().min(1).max(512),
  title: z.string().min(1).max(1024),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean(),
  bodyMarkdown: z.string().min(1),
  summary: z.string().max(50000).optional().nullable(),
  researchMarkdown: z.string().optional().nullable(),
  sourceBalanceSummary: z.string().optional().nullable(),
  articleAlignmentLabel: z.string().max(64).optional().nullable(),
  articleAlignmentConfidence: z.number().finite().min(0).max(1).optional().nullable(),
  articleAlignmentRationale: z.string().optional().nullable(),
  seoMetaTitle: z.string().max(128).optional().nullable(),
  seoMetaDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  seoOgTitle: z.string().max(128).optional().nullable(),
  seoOgDescription: z.string().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
  authorName: z.string().max(255).optional().nullable(),
  authorSlug: z.string().max(255).optional().nullable(),
  authorTitle: z.string().max(255).optional().nullable(),
  authorBio: z.string().max(5000).optional().nullable(),
  revisionSummary: z.string().max(5000).optional().nullable(),
  correctionSummary: z.string().max(5000).optional().nullable(),
  correctionDetails: z.string().max(5000).optional().nullable(),
});

export async function saveArticleAction(raw: z.infer<typeof articleSaveSchema>) {
  const user = await requireUser();
  const parsed = articleSaveSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid" };
  const d = parsed.data;
  const nextSlug = d.slug.trim();
  if (isReservedArticleSlug(nextSlug)) return { ok: false as const, error: "Reserved slug" };

  const existing = await prisma.article.findUnique({
    where: { id: d.id },
    include: { topic: { include: { category: true } } },
  });
  if (!existing) return { ok: false as const, error: "Not found" };
  const conflicting = await prisma.article.findFirst({
    where: { slug: nextSlug, id: { not: d.id } },
    select: { id: true },
  });
  if (conflicting) return { ok: false as const, error: "Slug exists" };

  const status = d.status as ArticleStatus;
  const publishedAt =
    status === "PUBLISHED"
      ? d.publishedAt
        ? new Date(d.publishedAt)
        : existing.publishedAt || new Date()
      : d.publishedAt
        ? new Date(d.publishedAt)
        : null;
  const scheduledFor = d.scheduledFor ? new Date(d.scheduledFor) : null;

  await prisma.$transaction(async (tx) => {
    await tx.article.update({
      where: { id: d.id },
      data: {
        slug: nextSlug,
        title: d.title.slice(0, 1024),
        status,
        featured: d.featured,
        publishedAt,
        scheduledFor,
        bodyMarkdown: d.bodyMarkdown,
        summary: d.summary ?? null,
        researchMarkdown: d.researchMarkdown ?? null,
        sourceBalanceSummary: d.sourceBalanceSummary ?? null,
        articleAlignmentLabel: d.articleAlignmentLabel ?? null,
        articleAlignmentConfidence: d.articleAlignmentConfidence ?? null,
        articleAlignmentRationale: d.articleAlignmentRationale ?? null,
        seoMetaTitle: d.seoMetaTitle?.slice(0, 128) ?? null,
        seoMetaDescription: d.seoMetaDescription ?? null,
        seoKeywords: d.seoKeywords ?? null,
        seoOgTitle: d.seoOgTitle?.slice(0, 128) ?? null,
        seoOgDescription: d.seoOgDescription ?? null,
      },
    });

    if (d.revisionSummary?.trim()) {
      await tx.articleRevision.create({
        data: {
          articleId: d.id,
          editorId: user.id,
          summary: d.revisionSummary.trim(),
        },
      });
    }

    if (d.correctionSummary?.trim()) {
      await tx.correctionNotice.create({
        data: {
          articleId: d.id,
          summary: d.correctionSummary.trim(),
          details: d.correctionDetails?.trim() || null,
        },
      });
    }
  });

  await upsertPrimaryAuthor({
    articleId: d.id,
    authorName: d.authorName ?? null,
    authorSlug: d.authorSlug ?? null,
    authorTitle: d.authorTitle ?? null,
    authorBio: d.authorBio ?? null,
  });

  revalidateArticlePaths(existing.topic.category.slug, nextSlug);
  if (existing.slug !== nextSlug) {
    revalidateArticlePaths(existing.topic.category.slug, existing.slug);
  }
  return { ok: true as const };
}

const articleCreateSchema = z.object({
  slug: z.string().min(1).max(512),
  title: z.string().min(1).max(1024),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  bodyMarkdown: z.string().min(1),
  categorySlug: z.string().min(1).max(255),
  categoryName: z.string().min(1).max(512).optional(),
  summary: z.string().max(50000).optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
  authorName: z.string().max(255).optional().nullable(),
  authorSlug: z.string().max(255).optional().nullable(),
  authorTitle: z.string().max(255).optional().nullable(),
  authorBio: z.string().max(5000).optional().nullable(),
});

export async function createArticleAdminAction(raw: z.infer<typeof articleCreateSchema>) {
  await requireUser();
  const parsed = articleCreateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid" };
  const data = parsed.data;
  const slug = data.slug.trim();
  if (isReservedArticleSlug(slug)) return { ok: false as const, error: "Reserved slug" };

  const categorySlug = data.categorySlug.trim();
  const categoryName = (data.categoryName?.trim() || categorySlug.replace(/-/g, " ")).slice(0, 512);

  let articleId: number | null = null;
  try {
    await prisma.$transaction(async (tx) => {
      const dup = await tx.article.findUnique({ where: { slug } });
      if (dup) throw new Error("SLUG");

      const category = await tx.category.upsert({
        where: { slug: categorySlug },
        create: { slug: categorySlug, name: categoryName },
        update: { name: categoryName },
      });

      const topicSlug = `admin-${slug}`.slice(0, 512);
      const topic = await tx.topic.create({
        data: {
          categoryId: category.id,
          title: data.title.slice(0, 1024),
          slug: topicSlug,
          status: "drafted",
          roundNumber: 1,
        },
      });

      const article = await tx.article.create({
        data: {
          topicId: topic.id,
          slug,
          title: data.title.slice(0, 1024),
          status: data.status as ArticleStatus,
          featured: data.featured,
          publishedAt:
            data.status === "PUBLISHED"
              ? data.publishedAt
                ? new Date(data.publishedAt)
                : new Date()
              : data.publishedAt
                ? new Date(data.publishedAt)
                : null,
          scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
          bodyMarkdown: data.bodyMarkdown,
          summary: data.summary ?? null,
        },
      });
      articleId = article.id;
    });
  } catch (e) {
    if (e instanceof Error && e.message === "SLUG") return { ok: false as const, error: "Slug exists" };
    return { ok: false as const, error: "Could not create" };
  }

  if (articleId) {
    await upsertPrimaryAuthor({
      articleId,
      authorName: data.authorName ?? null,
      authorSlug: data.authorSlug ?? null,
      authorTitle: data.authorTitle ?? null,
      authorBio: data.authorBio ?? null,
    });
  }

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${categorySlug}`);
  revalidatePath(`/news/${categorySlug}/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  return { ok: true as const };
}

export async function logAdClickAction(placementId: string) {
  await requireUser();
  await prisma.adClick.create({ data: { placementId } });
  await prisma.analyticsEvent.create({
    data: {
      type: "AD_CLICK",
      placementId,
      path: "/admin/ads",
    },
  });
  revalidatePath("/admin/analytics");
  return { ok: true as const };
}
