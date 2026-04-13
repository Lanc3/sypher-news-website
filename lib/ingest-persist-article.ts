import { prisma } from "@/lib/prisma";
import type { ArticleIngestBody } from "@/lib/ingest-schema";
import { isReservedArticleSlug } from "@/lib/reserved-slugs";

export class SlugConflictError extends Error {
  override name = "SlugConflictError";
}

export class ReservedSlugError extends Error {
  override name = "ReservedSlugError";
}

function categoryFields(data: ArticleIngestBody) {
  const categorySlug = typeof data.category === "string" ? data.category : data.category.slug;
  const categoryName =
    typeof data.category === "string"
      ? data.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : (data.category.name ?? data.category.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
  return { categorySlug, categoryName };
}

function dedupeSources(data: ArticleIngestBody) {
  const seenUrls = new Set<string>();
  return data.sources.filter((s) => {
    const k = s.url.toLowerCase();
    if (seenUrls.has(k)) return false;
    seenUrls.add(k);
    return true;
  });
}

const sourceRows = (dedupedSources: ArticleIngestBody["sources"]) =>
  dedupedSources.map((s) => ({
    url: s.url,
    title: s.title ?? null,
    snippet: s.snippet ?? null,
    sourceDepth: s.source_depth ?? 0,
    sourceCredibilityTier: s.source_credibility_tier ?? null,
    fetchError: s.fetch_error ?? null,
    alignmentAxis: s.alignment_axis ?? null,
    alignmentLabel: s.alignment_label ?? null,
    alignmentConfidence: s.alignment_confidence ?? null,
    alignmentRationale: s.alignment_rationale ?? null,
    alignmentAssessedAt: s.alignment_assessed_at ? new Date(s.alignment_assessed_at) : null,
    alignmentModelVersion: s.alignment_model_version ?? null,
    stakeholderRole: s.stakeholder_role ?? null,
    editorialFrame: s.editorial_frame ?? null,
  }));

function jsonStringOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return null;
  }
}

/**
 * Persists article ingest payload. When `upsert` is false, duplicate slug throws {@link SlugConflictError}.
 */
export async function persistArticleIngest(
  data: ArticleIngestBody,
  options: { upsert: boolean },
): Promise<"created" | "updated"> {
  if (isReservedArticleSlug(data.slug)) {
    throw new ReservedSlugError();
  }

  const { categorySlug, categoryName } = categoryFields(data);
  const dedupedSources = dedupeSources(data);
  const sourcesPayload = sourceRows(dedupedSources);

  let outcome: "created" | "updated" = "created";

  await prisma.$transaction(async (tx) => {
    const existing = await tx.article.findUnique({
      where: { slug: data.slug },
      include: { topic: true },
    });

    if (existing && !options.upsert) {
      throw new SlugConflictError();
    }

    const category = await tx.category.upsert({
      where: { slug: categorySlug },
      create: { slug: categorySlug, name: categoryName },
      update: { name: categoryName },
    });

    let authorStyleId: number | null = null;
    if (data.author?.trim()) {
      const name = data.author.trim().slice(0, 255);
      const style = await tx.authorStyle.upsert({
        where: { name },
        create: {
          name,
          systemPromptFragment: "[ingest] placeholder fragment for external author attribution",
        },
        update: {},
      });
      authorStyleId = style.id;
    }

    if (existing && options.upsert) {
      outcome = "updated";
      await tx.topic.update({
        where: { id: existing.topicId },
        data: {
          categoryId: category.id,
          title: data.title.slice(0, 1024),
        },
      });
      await tx.article.update({
        where: { id: existing.id },
        data: {
          title: data.title.slice(0, 1024),
          bodyMarkdown: data.body_markdown,
          summary: data.summary ?? null,
          authorStyleId,
          researchMarkdown: data.research_markdown ?? null,
          sourceBalanceSummary: data.source_balance_summary ?? null,
          articleAlignmentLabel: data.article_alignment_label ?? null,
          articleAlignmentConfidence: data.article_alignment_confidence ?? null,
          articleAlignmentRationale: data.article_alignment_rationale ?? null,
          seoMetaTitle: data.seo_meta_title?.slice(0, 128) ?? null,
          seoMetaDescription: data.seo_meta_description ?? null,
          seoKeywords: data.seo_keywords ?? null,
          seoOgTitle: data.seo_og_title?.slice(0, 128) ?? null,
          seoOgDescription: data.seo_og_description ?? null,
          claimMapJson: jsonStringOrNull(data.claim_map),
          confidenceDashboardJson: jsonStringOrNull(data.confidence_dashboard),
          perspectiveSpectrumJson: jsonStringOrNull(data.perspective_spectrum),
        },
      });
      await tx.articleSource.deleteMany({ where: { articleId: existing.id } });
      if (sourcesPayload.length > 0) {
        await tx.articleSource.createMany({
          data: sourcesPayload.map((row) => ({ ...row, articleId: existing.id })),
        });
      }
      return;
    }

    outcome = "created";
    const topicSlug = `ingest-${data.slug}`.slice(0, 512);
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
        slug: data.slug,
        title: data.title.slice(0, 1024),
        bodyMarkdown: data.body_markdown,
        summary: data.summary ?? null,
        authorStyleId,
        researchMarkdown: data.research_markdown ?? null,
        sourceBalanceSummary: data.source_balance_summary ?? null,
        articleAlignmentLabel: data.article_alignment_label ?? null,
        articleAlignmentConfidence: data.article_alignment_confidence ?? null,
        articleAlignmentRationale: data.article_alignment_rationale ?? null,
        seoMetaTitle: data.seo_meta_title?.slice(0, 128) ?? null,
        seoMetaDescription: data.seo_meta_description ?? null,
        seoKeywords: data.seo_keywords ?? null,
        seoOgTitle: data.seo_og_title?.slice(0, 128) ?? null,
        seoOgDescription: data.seo_og_description ?? null,
        claimMapJson: jsonStringOrNull(data.claim_map),
        confidenceDashboardJson: jsonStringOrNull(data.confidence_dashboard),
        perspectiveSpectrumJson: jsonStringOrNull(data.perspective_spectrum),
        sources: {
          create: sourcesPayload,
        },
      },
    });
  });

  return outcome;
}
