import type { ArticleIngestBody } from "@/lib/ingest-schema";
import { articleIngestBodySchema } from "@/lib/ingest-schema";

type UnknownRecord = Record<string, unknown>;

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

/** Zod ingest expects alignment scores in [0, 1]; Sypher / LLM may send edge values or strings. */
function unitIntervalOrUndefined(v: unknown): number | undefined {
  let n: number | undefined;
  if (typeof v === "number" && Number.isFinite(v)) n = v;
  else if (typeof v === "string" && v.trim()) {
    const p = Number(v.trim());
    if (Number.isFinite(p)) n = p;
  }
  if (n === undefined) return undefined;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/** Normalize to ISO string Zod accepts; drop invalid / naive timestamps from Sypher. */
function alignmentAssessedAtOrUndefined(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  if (!t) return undefined;
  const ms = Date.parse(t);
  if (Number.isNaN(ms)) return undefined;
  return new Date(ms).toISOString();
}

/**
 * Maps Sypher-News `build_export_bundle` JSON into the flat shape expected by {@link articleIngestBodySchema}.
 */
export function sypherBundleToIngestCandidate(bundle: unknown): unknown | null {
  if (!bundle || typeof bundle !== "object") return null;
  const b = bundle as { article?: UnknownRecord; category?: UnknownRecord | null };
  const a = b.article;
  if (!a) return null;

  const slug = str(a.slug);
  const title = str(a.title);
  const bodyMarkdown = str(a.body_markdown);
  if (!slug || !title || !bodyMarkdown) return null;

  const catObj = b.category && typeof b.category === "object" ? b.category : null;
  const catSlug = str(catObj?.slug) ?? str(a.category_slug);
  if (!catSlug) return null;
  const catName = str(catObj?.name) ?? str(a.category_name);

  const category = catName ? { slug: catSlug, name: catName } : catSlug;

  const sourcesRaw = Array.isArray(a.sources) ? a.sources : [];
  const sources = sourcesRaw
    .filter((s): s is UnknownRecord => s !== null && typeof s === "object")
    .map((s) => ({
      url: str(s.url),
      title: s.title === null || s.title === undefined ? null : str(s.title as string),
      snippet: s.snippet === null || s.snippet === undefined ? null : (s.snippet as string | null),
      source_depth: typeof s.source_depth === "number" ? s.source_depth : undefined,
      source_credibility_tier:
        s.source_credibility_tier === null || s.source_credibility_tier === undefined
          ? null
          : str(s.source_credibility_tier as string),
      fetch_error:
        s.fetch_error === null || s.fetch_error === undefined ? null : (s.fetch_error as string | null),
      alignment_axis:
        s.alignment_axis === null || s.alignment_axis === undefined ? undefined : str(s.alignment_axis as string),
      alignment_label:
        s.alignment_label === null || s.alignment_label === undefined ? null : str(s.alignment_label as string),
      alignment_confidence: unitIntervalOrUndefined(s.alignment_confidence),
      alignment_rationale:
        s.alignment_rationale === null || s.alignment_rationale === undefined
          ? null
          : (s.alignment_rationale as string | null),
      alignment_assessed_at: alignmentAssessedAtOrUndefined(s.alignment_assessed_at),
      alignment_model_version:
        s.alignment_model_version === null || s.alignment_model_version === undefined
          ? undefined
          : str(s.alignment_model_version as string),
    }))
    .filter((s) => s.url);

  return {
    slug,
    title,
    body_markdown: bodyMarkdown,
    summary: a.summary === null || a.summary === undefined ? null : (a.summary as string | null),
    category,
    sources,
    author: str(a.author),
    research_markdown:
      a.research_markdown === null || a.research_markdown === undefined
        ? null
        : (a.research_markdown as string | null),
    source_balance_summary:
      a.source_balance_summary === null || a.source_balance_summary === undefined
        ? null
        : (a.source_balance_summary as string | null),
    article_alignment_label:
      a.article_alignment_label === null || a.article_alignment_label === undefined
        ? null
        : str(a.article_alignment_label as string),
    article_alignment_confidence: unitIntervalOrUndefined(a.article_alignment_confidence),
    article_alignment_rationale:
      a.article_alignment_rationale === null || a.article_alignment_rationale === undefined
        ? null
        : (a.article_alignment_rationale as string | null),
    seo_meta_title: str(a.seo_meta_title),
    seo_meta_description:
      a.seo_meta_description === null || a.seo_meta_description === undefined
        ? null
        : (a.seo_meta_description as string | null),
    seo_keywords:
      a.seo_keywords === null || a.seo_keywords === undefined ? null : (a.seo_keywords as string | null),
    seo_og_title: str(a.seo_og_title),
    seo_og_description:
      a.seo_og_description === null || a.seo_og_description === undefined
        ? null
        : (a.seo_og_description as string | null),
  };
}

export type SypherBundleParseFailure = {
  ok: false;
  message: string;
  issues?: { formErrors: string[]; fieldErrors: Record<string, string[] | undefined> };
};

export function parseSypherBundle(bundle: unknown): { ok: true; data: ArticleIngestBody } | SypherBundleParseFailure {
  const candidate = sypherBundleToIngestCandidate(bundle);
  if (!candidate) {
    return { ok: false, message: "Expected { article: { slug, title, body_markdown, ... }, category?: { slug } }" };
  }
  const parsed = articleIngestBodySchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Bundle did not match ingest schema", issues: parsed.error.flatten() };
  }
  return { ok: true, data: parsed.data };
}
