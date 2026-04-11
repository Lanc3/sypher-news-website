import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticleBySlug } from "@/lib/article-public";
import { MarkdownBody } from "@/components/markdown-body";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { PageViewTracker } from "@/components/page-view-tracker";
import { InArticleAdSlot, SidebarAdSlot } from "@/components/ad-provider";
import { siteUrl } from "@/lib/site-url";
import { SiteContainer } from "@/components/site-container";

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
      publishedTime: article.createdAt.toISOString(),
      section: article.topic?.category?.name ?? undefined,
      url: path,
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

  const transparency =
    article.articleAlignmentConfidence != null
      ? Math.round(article.articleAlignmentConfidence * 100)
      : null;

  return (
    <>
      <ArticleJsonLd
        title={title}
        description={description}
        urlPath={path}
        datePublished={article.createdAt.toISOString()}
        section={article.topic.category.name}
      />
      <PageViewTracker path={path} articleId={article.id} />
      <main className="flex-1 py-8 sm:py-10 lg:py-12">
        <SiteContainer max="lg" className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <article className="min-w-0 flex-1">
            <div className="panel px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[#ff2bd6] sm:text-xs">
                /news/{article.topic.category.slug}
              </p>
              <h1 className="mt-3 font-mono text-[1.65rem] font-bold leading-tight tracking-tight text-[#00ff41] drop-shadow-[0_0_14px_rgba(0,255,65,0.18)] sm:text-3xl md:text-4xl">
                {article.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono text-[#888] sm:gap-3 sm:text-xs">
                <time dateTime={article.createdAt.toISOString()}>{article.createdAt.toISOString().slice(0, 10)}</time>
                {transparency != null ? (
                  <span className="rounded border border-[#00ff41]/40 px-2 py-0.5 text-[#00ff41]">
                    Transparency index ~{transparency}
                  </span>
                ) : null}
                {article.articleAlignmentLabel ? (
                  <span className="text-[#ff2bd6]/80">alignment: {article.articleAlignmentLabel}</span>
                ) : null}
              </div>

              <div className="mt-8 space-y-10 sm:mt-10">
                <section>
                  <h2 className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-[#e0e0e0]/70 sm:text-sm">
                    Transmission
                  </h2>
                  <MarkdownBody content={article.bodyMarkdown} />
                </section>

                <InArticleAdSlot />

                {(article.researchMarkdown || article.articleAlignmentRationale) && (
                  <section className="panel border-[#00ff41]/35 bg-black/70 p-4 sm:p-5">
                    <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-[#00ff41] sm:text-sm">
                      :: DISASSEMBLY
                    </h2>
                    <div className="mt-3 font-mono text-sm text-[#c8ffc8]">
                      {article.researchMarkdown ? <MarkdownBody content={article.researchMarkdown} /> : null}
                      {article.articleAlignmentRationale ? (
                        <div className="mt-4 border-t border-[#00ff41]/20 pt-4 text-[#a0a0a0]">
                          <p className="text-[10px] font-medium uppercase tracking-widest text-[#ff2bd6] sm:text-xs">
                            Alignment rationale
                          </p>
                          <MarkdownBody content={article.articleAlignmentRationale} />
                        </div>
                      ) : null}
                    </div>
                  </section>
                )}

                {article.sources.length > 0 ? (
                  <section>
                    <h2 className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-[#e0e0e0]/70 sm:text-sm">
                      Source matrix
                    </h2>
                    <ul className="space-y-3 text-sm">
                      {article.sources.map((s) => (
                        <li key={s.id} className="panel border-[#00ff41]/12 p-3 sm:p-4">
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-words text-[#ff2bd6] underline decoration-[#ff2bd6]/50 underline-offset-2 hover:decoration-[#ff2bd6]"
                          >
                            {s.title || s.url}
                          </a>
                          {s.snippet ? <p className="mt-2 text-xs leading-relaxed text-[#9a9a9a] sm:text-sm">{s.snippet}</p> : null}
                          {s.alignmentLabel ? (
                            <p className="mt-2 text-[11px] font-mono text-[#00ff41]/70 sm:text-xs">label: {s.alignmentLabel}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center font-mono text-sm text-[#00ff41] underline decoration-[#00ff41]/40 underline-offset-4 hover:decoration-[#00ff41]"
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
