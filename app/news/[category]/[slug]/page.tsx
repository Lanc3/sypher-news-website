import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticleBySlug } from "@/lib/article-public";
import { MarkdownBody } from "@/components/markdown-body";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { PageViewTracker } from "@/components/page-view-tracker";
import { InArticleAdSlot, SidebarAdSlot } from "@/components/ad-provider";
import { siteUrl } from "@/lib/site-url";

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
      <main className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-10">
        <article className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#ff2bd6]">
            /news/{article.topic.category.slug}
          </p>
          <h1 className="mt-2 font-mono text-3xl font-bold tracking-tight text-[#00ff41] drop-shadow-[0_0_12px_rgba(0,255,65,0.2)] md:text-4xl">
            {article.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-mono text-[#888]">
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

          <div className="mt-10 space-y-10">
            <section>
              <h2 className="mb-3 font-mono text-sm uppercase tracking-widest text-[#e0e0e0]/70">Transmission</h2>
              <MarkdownBody content={article.bodyMarkdown} />
            </section>

            <InArticleAdSlot />

            {(article.researchMarkdown || article.articleAlignmentRationale) && (
              <section className="rounded-lg border border-[#00ff41]/30 bg-black/70 p-4 shadow-[inset_0_0_0_1px_rgba(0,255,65,0.08)]">
                <h2 className="font-mono text-sm uppercase tracking-widest text-[#00ff41]">:: DISASSEMBLY</h2>
                <div className="mt-3 font-mono text-sm text-[#c8ffc8]">
                  {article.researchMarkdown ? <MarkdownBody content={article.researchMarkdown} /> : null}
                  {article.articleAlignmentRationale ? (
                    <div className="mt-4 border-t border-[#00ff41]/20 pt-4 text-[#a0a0a0]">
                      <p className="text-xs uppercase text-[#ff2bd6]">Alignment rationale</p>
                      <MarkdownBody content={article.articleAlignmentRationale} />
                    </div>
                  ) : null}
                </div>
              </section>
            )}

            {article.sources.length > 0 ? (
              <section>
                <h2 className="mb-3 font-mono text-sm uppercase tracking-widest text-[#e0e0e0]/70">Source matrix</h2>
                <ul className="space-y-3 text-sm">
                  {article.sources.map((s) => (
                    <li key={s.id} className="rounded border border-[#00ff41]/15 bg-black/40 p-3">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[#ff2bd6] hover:underline">
                        {s.title || s.url}
                      </a>
                      {s.snippet ? <p className="mt-1 text-xs text-[#9a9a9a]">{s.snippet}</p> : null}
                      {s.alignmentLabel ? (
                        <p className="mt-1 text-xs font-mono text-[#00ff41]/70">label: {s.alignmentLabel}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <Link href="/" className="inline-block font-mono text-sm text-[#00ff41] hover:underline">
              ← /home
            </Link>
          </div>
        </article>
        <SidebarAdSlot />
      </main>
    </>
  );
}
