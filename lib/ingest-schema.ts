import { z } from "zod";

const httpUrl = z
  .string()
  .min(1)
  .max(4096)
  .superRefine((val, ctx) => {
    let parsed: URL;
    try {
      parsed = new URL(val);
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid URL" });
      return;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URL must be http(s)" });
    }
  });

export const articleSourceIngestSchema = z.object({
  url: httpUrl,
  title: z.string().max(1024).optional().nullable(),
  snippet: z.string().optional().nullable(),
  source_depth: z.number().int().min(0).optional().nullable(),
  source_credibility_tier: z.string().max(64).optional().nullable(),
  fetch_error: z.string().optional().nullable(),
  alignment_axis: z.string().max(64).optional().nullable(),
  alignment_label: z.string().max(64).optional().nullable(),
  alignment_confidence: z
    .number()
    .finite()
    .min(0)
    .max(1)
    .optional()
    .nullable(),
  alignment_rationale: z.string().optional().nullable(),
  // Sypher sends ISO from Python (often without "Z"); accept any parseable instant.
  alignment_assessed_at: z.string().min(4).max(64).optional().nullable(),
  alignment_model_version: z.string().max(64).optional().nullable(),
});

export const categoryIngestSchema = z.union([
  z
    .string()
    .min(1)
    .max(255)
    .transform((s) => s.trim()),
  z.object({
    slug: z.string().min(1).max(255).transform((s) => s.trim()),
    name: z.string().min(1).max(512).optional(),
  }),
]);

export const articleIngestBodySchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(512)
      .transform((s) => s.trim()),
    title: z.string().min(1).max(1024),
    body_markdown: z.string().min(1).max(1_500_000),
    summary: z.string().max(50_000).optional().nullable(),
    category: categoryIngestSchema,
    sources: z.array(articleSourceIngestSchema).max(500).default([]),
    author: z.string().min(1).max(255).optional().nullable(),
    research_markdown: z.string().max(1_500_000).optional().nullable(),
    source_balance_summary: z.string().max(50_000).optional().nullable(),
    article_alignment_label: z.string().max(64).optional().nullable(),
    article_alignment_confidence: z.number().finite().min(0).max(1).optional().nullable(),
    article_alignment_rationale: z.string().max(50_000).optional().nullable(),
    seo_meta_title: z.string().max(128).optional().nullable(),
    seo_meta_description: z.string().max(5000).optional().nullable(),
    seo_keywords: z.string().max(5000).optional().nullable(),
    seo_og_title: z.string().max(128).optional().nullable(),
    seo_og_description: z.string().max(5000).optional().nullable(),
  });

export type ArticleIngestBody = z.infer<typeof articleIngestBodySchema>;
