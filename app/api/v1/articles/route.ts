import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { articleIngestBodySchema } from "@/lib/ingest-schema";
import { rateLimitIngest } from "@/lib/rate-limit";
import { isReservedArticleSlug } from "@/lib/reserved-slugs";
import { getApiKeyFromRequest } from "@/lib/request-api-key";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

class SlugConflictError extends Error {
  override name = "SlugConflictError";
}

const MAX_BODY_BYTES = 2 * 1024 * 1024;

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { code, message, ...extra } }, { status });
}

export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}

export async function POST(req: Request) {
  const expected = process.env.ARTICLES_INGEST_API_KEY;
  if (!expected) {
    return jsonError(503, "ingest_disabled", "ARTICLES_INGEST_API_KEY is not configured");
  }
  const key = getApiKeyFromRequest(req);
  if (!key || key !== expected) {
    return jsonError(401, "unauthorized", "Invalid or missing API key");
  }

  const id = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const rl = await rateLimitIngest(`ingest:${id}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many requests" } },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } },
    );
  }

  const len = Number(req.headers.get("content-length") || "0");
  if (len > MAX_BODY_BYTES) {
    return jsonError(413, "payload_too_large", "Request body too large");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "invalid_json", "Malformed JSON body");
  }

  const parsed = articleIngestBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "validation_error", "Invalid payload", {
      issues: parsed.error.flatten(),
    });
  }

  const data = parsed.data;
  if (isReservedArticleSlug(data.slug)) {
    return jsonError(422, "reserved_slug", "Slug is reserved");
  }

  const categorySlug = typeof data.category === "string" ? data.category : data.category.slug;
  const categoryName =
    typeof data.category === "string"
      ? data.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : (data.category.name ?? data.category.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));

  const seenUrls = new Set<string>();
  const dedupedSources = data.sources.filter((s) => {
    const k = s.url.toLowerCase();
    if (seenUrls.has(k)) return false;
    seenUrls.add(k);
    return true;
  });

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.article.findUnique({ where: { slug: data.slug } });
      if (existing) throw new SlugConflictError();

      const category = await tx.category.upsert({
        where: { slug: categorySlug },
        create: { slug: categorySlug, name: categoryName },
        update: { name: categoryName },
      });

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
          sources: {
            create: dedupedSources.map((s) => ({
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
            })),
          },
        },
      });
    });
  } catch (e) {
    if (e instanceof SlugConflictError) {
      return jsonError(409, "slug_conflict", "An article with this slug already exists");
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return jsonError(409, "slug_conflict", "An article with this slug already exists");
    }
    console.error("[ingest]", e);
    return jsonError(500, "server_error", "Failed to persist article");
  }

  return NextResponse.json({ ok: true, slug: data.slug }, { status: 201 });
}
