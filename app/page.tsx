import { listRecentArticles } from "@/lib/article-public";
import { HomeArticleFilters, type HomeArticle } from "@/components/home-article-filters";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function HomePage() {
  const rows = await listRecentArticles(48);
  const articles: HomeArticle[] = rows
    .filter((a) => a.topic?.category)
    .map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      createdAt: a.createdAt.toISOString(),
      categorySlug: a.topic!.category!.slug,
      categoryName: a.topic!.category!.name,
      transparency:
        a.articleAlignmentConfidence != null ? Math.round(a.articleAlignmentConfidence * 100) : null,
    }));

  return (
    <main className="mx-auto max-w-4xl flex-1 px-4 py-12">
      <section className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#ff2bd6]">Signal / noise</p>
        <h1 className="mt-4 font-mono text-4xl font-bold text-[#00ff41] drop-shadow-[0_0_18px_rgba(0,255,65,0.25)] md:text-5xl">
          Disassemble the headline.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#a8a8a8]">
          Transparent sourcing, alignment telemetry, and terminal-grade deconstructions of the mainstream narrative.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="mb-6 font-mono text-lg text-[#e0e0e0]">Latest wire</h2>
        <HomeArticleFilters articles={articles} />
      </section>
    </main>
  );
}
