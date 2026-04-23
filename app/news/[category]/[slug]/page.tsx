import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticleBySlug, listRelatedArticles } from "@/lib/article-public";
import { ArticleBreadcrumbs } from "@/components/article-breadcrumbs";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { PageViewTracker } from "@/components/page-view-tracker";
import { InArticleAdSlot, SidebarAdSlot } from "@/components/ad-provider";
import { RelatedArticles } from "@/components/related-articles";
import { ShareActions } from "@/components/share-actions";
import { siteUrl } from "@/lib/site-url";
import { SiteContainer } from "@/components/site-container";
import { TransparencyPanel } from "@/components/transparency-panel";
import { ConfidenceDashboard } from "@/components/confidence-dashboard";
import { ClaimMap } from "@/components/claim-map";
import { PerspectiveSpectrum } from "@/components/perspective-spectrum";
import { DisassemblyTabs } from "@/components/disassembly-tabs";
import { ArticleTTSPlayer } from "@/components/article-tts-player";

/** Avoid caching notFound/redirect decisions while articles are ingested after deploy. */
export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article" };
  const title = article.seoMetaTitle?.trim() || article.title;
  const description = (article.seoMetaDescription || article.summary || "").trim() || undefined;
  const ogTitle = article.seoOgTitle?.trim() || title;
  const ogDesc = (article.seoOgDescription || article.summary || "").trim() || description;
  const cat = article.topic?.category?.slug;
  const base = siteUrl();
  const path = cat ? `/news/${cat}/${article.slug}` : `/news/_/`;
  return {
    metadataBase: new URL(base),
    title,
    description,
    keywords: article.seoKeywords?.split(",").map((s) => s.trim()).filter(Boolean),
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      type: "article",
      publishedTime: (article.publishedAt || article.createdAt).toISOString(),
      section: article.topic?.category?.name ?? undefined,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDesc,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { category, slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || !article.topic?.category) notFound();

  if (article.topic.category.slug !== category) {
    permanentRedirect(`/news/${article.topic.category.slug}/${article.slug}`);
  }

  const path = `/news/${article.topic.category.slug}/${article.slug}`;
  const title = article.seoMetaTitle?.trim() || article.title;
  const description = (article.seoMetaDescription || article.summary || "").trim() || article.title;
  const related = await listRelatedArticles(article.id, article.topic.category.id, 4);

  const transparency =
    article.articleAlignmentConfidence != null
      ? Math.round(article.articleAlignmentConfidence * 100)
      : null;
  const articleUrl = `${siteUrl()}${path}`;

  function safeJson<T>(raw: string | null | undefined): T | null {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  const claimMap = safeJson<Array<{
    claim: string;
    sources_supporting: string[];
    sources_contradicting: string[];
    confidence_tag: string;
    who_benefits: string;
    what_is_missing: string;
  }>>(article.claimMapJson);

  const confidenceDashboard = safeJson<{
    total_claims: number;
    verified: number;
    partially_verified: number;
    single_source: number;
    unverifiable: number;
    overall_evidence_strength: string;
    source_domain_count: number;
  }>(article.confidenceDashboardJson);

  const perspectiveSpectrum = safeJson<Array<{
    source: string;
    url: string;
    stakeholder_role: string;
    editorial_frame: string;
    alignment_label: string;
  }>>(article.perspectiveSpectrumJson);

  return (
    <>
      <ArticleJsonLd
        title={title}
        description={description}
        urlPath={path}
        datePublished={(article.publishedAt || article.createdAt).toISOString()}
        dateModified={article.updatedAt.toISOString()}
        section={article.topic.category.name}
      />
      <PageViewTracker path={path} articleId={article.id} />
      <main id="main-content" className="flex-1 py-8 sm:py-10 lg:py-12">
        <SiteContainer max="lg" className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <article className="min-w-0 flex-1">
            <div className="panel px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              <ArticleBreadcrumbs
                categorySlug={article.topic.category.slug}
                categoryName={article.topic.category.name}
                title={article.title}
              />
              <p className="text-magenta-glow font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[#bc13fe] sm:text-xs">
                /news/{article.topic.category.slug}
              </p>
              <h1 className="text-neon-glow mt-3 font-mono text-[1.65rem] font-bold leading-tight tracking-tight text-[#00e8ff] sm:text-3xl md:text-4xl">
                {article.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono text-[#888] sm:gap-3 sm:text-xs">
                <time dateTime={(article.publishedAt || article.createdAt).toISOString()}>
                  Published {(article.publishedAt || article.createdAt).toISOString().slice(0, 10)}
                </time>
                <span className="text-[#555]" aria-hidden>
                  ·
                </span>
                <time dateTime={article.updatedAt.toISOString()}>Updated {article.updatedAt.toISOString().slice(0, 10)}</time>
                {transparency != null ? (
                  <span className="rounded border border-[#00e8ff]/40 px-2 py-0.5 text-[#00e8ff]">
                    Transparency index ~{transparency}
                  </span>
                ) : null}
                {article.articleAlignmentLabel ? (
                  <span className="text-[#bc13fe]/80">alignment: {article.articleAlignmentLabel}</span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#a7a7a7]">
                <span className="font-mono uppercase tracking-[0.2em] text-[#666]">By</span>
                <Link
                  href="/about"
                  rel="author"
                  className="text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-4 hover:decoration-[#bc13fe]"
                >
                  Aaron Keating
                </Link>
              </div>

              <div className="mt-6">
                <ArticleTTSPlayer title={article.title} bodyMarkdown={article.bodyMarkdown} />
              </div>

              <div className="mt-8 space-y-10 sm:mt-10">
                {article.corrections.length > 0 ? (
                  <section className="panel border-[#bc13fe]/30 bg-black/60 p-4">
                    <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#bc13fe]">Corrections</h2>
                    <ul className="mt-3 space-y-3 text-sm text-[#d7d7d7]">
                      {article.corrections.map((notice) => (
                        <li key={notice.id}>
                          <p>{notice.summary}</p>
                          {notice.details ? <p className="mt-1 text-[#9a9a9a]">{notice.details}</p> : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <ConfidenceDashboard dashboard={confidenceDashboard} />

                <section>
                  <h2 className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-[#e0e0e0]/70 sm:text-sm">
                    :: DISASSEMBLY
                  </h2>
                  <DisassemblyTabs
                    bodyMarkdown={article.bodyMarkdown}
                    researchMarkdown={article.researchMarkdown}
                  />
                </section>

                {article.revisions.length > 0 && (
                  <section className="panel border-[#00e8ff]/20 bg-black/50 p-4 sm:p-5">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#bc13fe] sm:text-xs">
                      Recent editorial updates
                    </p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {article.revisions.map((revision) => (
                        <li key={revision.id}>
                          <span className="text-[#e9f6f8]">{revision.summary}</span>
                          <span className="ml-2 text-[#777]">{revision.createdAt.toISOString().slice(0, 10)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <ClaimMap claims={claimMap} />

                <TransparencyPanel
                  transparency={transparency}
                  label={article.articleAlignmentLabel}
                  sourceBalanceSummary={article.sourceBalanceSummary}
                  rationale={article.articleAlignmentRationale}
                />

                <PerspectiveSpectrum
                  spectrum={perspectiveSpectrum}
                  sources={article.sources}
                  sourceBalanceSummary={article.sourceBalanceSummary}
                  articleAlignmentLabel={article.articleAlignmentLabel}
                  articleAlignmentConfidence={article.articleAlignmentConfidence}
                  articleAlignmentRationale={article.articleAlignmentRationale}
                />

                <ShareActions url={articleUrl} title={article.title} />

                <aside className="panel rounded-lg border border-[#00e8ff]/15 bg-black/40 px-5 py-5 sm:px-6 sm:py-6">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#bc13fe] sm:text-xs">About the author</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#d7d7d7]">
                    <strong className="text-[#e8e8e8]">Aaron Keating</strong> is the editor of Sypher News. He
                    writes about how mainstream outlets cover — and mis-cover — crypto, AI, and tech policy.
                  </p>
                  <p className="mt-2 text-sm">
                    <Link href="/about" className="text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-4 hover:decoration-[#bc13fe]">
                      More about Aaron →
                    </Link>
                  </p>
                </aside>

                <InArticleAdSlot />

                <RelatedArticles articles={related} />

                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center font-mono text-sm text-[#00e8ff] underline decoration-[#00e8ff]/40 underline-offset-4 hover:decoration-[#00e8ff]"
                >
                  ← /home
                </Link>
              </div>
            </div>
          </article>
          <SidebarAdSlot />
        </SiteContainer>
      </main>
    </>
  );
}
