"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AdSlot } from "@prisma/client";
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
});

export async function updateAdPlacementAction(raw: z.infer<typeof placementUpdateSchema>) {
  await requireUser();
  const parsed = placementUpdateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid" };
  const { slot, enabled, adUnitPath, providerKey } = parsed.data;
  await prisma.adPlacement.update({
    where: { slot: slot as AdSlot },
    data: {
      enabled,
      adUnitPath: adUnitPath?.trim() || null,
      providerKey: providerKey?.trim() || null,
    },
  });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

const articleSaveSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(1024),
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
});

export async function saveArticleAction(raw: z.infer<typeof articleSaveSchema>) {
  await requireUser();
  const parsed = articleSaveSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid" };
  const d = parsed.data;

  const existing = await prisma.article.findUnique({
    where: { id: d.id },
    include: { topic: { include: { category: true } } },
  });
  if (!existing) return { ok: false as const, error: "Not found" };

  await prisma.article.update({
    where: { id: d.id },
    data: {
      title: d.title.slice(0, 1024),
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

  revalidateArticlePaths(existing.topic.category.slug, existing.slug);
  return { ok: true as const };
}

const articleCreateSchema = z.object({
  slug: z.string().min(1).max(512),
  title: z.string().min(1).max(1024),
  bodyMarkdown: z.string().min(1),
  categorySlug: z.string().min(1).max(255),
  categoryName: z.string().min(1).max(512).optional(),
  summary: z.string().max(50000).optional().nullable(),
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

      await tx.article.create({
        data: {
          topicId: topic.id,
          slug,
          title: data.title.slice(0, 1024),
          bodyMarkdown: data.bodyMarkdown,
          summary: data.summary ?? null,
        },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "SLUG") return { ok: false as const, error: "Slug exists" };
    return { ok: false as const, error: "Could not create" };
  }

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${categorySlug}`);
  revalidatePath(`/news/${categorySlug}/${slug}`);
  return { ok: true as const };
}

export async function logAdClickAction(placementId: string) {
  await requireUser();
  await prisma.adClick.create({ data: { placementId } });
  return { ok: true as const };
}
