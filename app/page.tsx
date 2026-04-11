import { listRecentArticles } from "@/lib/article-public";
import { HomeArticleFilters, type HomeArticle } from "@/components/home-article-filters";
import { SiteContainer } from "@/components/site-container";

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
    <main className="flex-1 py-10 sm:py-14 lg:py-16">
      <SiteContainer max="md">
        <section className="panel px-5 py-8 text-center sm:px-8 sm:py-10">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-[#ff2bd6] sm:text-xs">
            Signal / noise
          </p>
          <h1 className="mt-4 font-mono text-[1.65rem] font-bold leading-tight tracking-tight text-[#00ff41] drop-shadow-[0_0_18px_rgba(0,255,65,0.22)] sm:text-4xl lg:text-5xl">
            Disassemble the headline.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#a8a8a8] sm:text-base">
            Transparent sourcing, alignment telemetry, and terminal-grade deconstructions of the mainstream narrative.
          </p>
        </section>

        <section className="mt-12 sm:mt-16 lg:mt-20">
          <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-mono text-lg font-semibold tracking-wide text-[#e8e8e8] sm:text-xl">Latest wire</h2>
            <p className="text-xs text-[#666] sm:text-sm">Filter by channel, transparency, or date.</p>
          </div>
          <HomeArticleFilters articles={articles} />
        </section>
      </SiteContainer>
    </main>
  );
}
