import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { HomeSection } from "@/components/home-section";
import { SearchQueryTracker } from "@/components/search-query-tracker";
import { SiteContainer } from "@/components/site-container";
import { searchPublicArticles } from "@/lib/article-public";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Sypher News coverage by title, summary, body, or category.",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? await searchPublicArticles(query, 24) : [];

  return (
    <main id="main-content" className="flex-1 py-10 sm:py-14">
      <SiteContainer max="lg" className="space-y-8">
        {query ? <SearchQueryTracker query={query} /> : null}
        <section className="panel px-5 py-6 sm:px-8 sm:py-8">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-[#bc13fe] sm:text-xs">Search</p>
          <h1 className="mt-2 font-mono text-2xl font-bold tracking-tight text-[#00e8ff] sm:text-3xl">Search the signal</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#9a9a9a] sm:text-base">
            Search titles, summaries, categories, and article bodies to find coverage and analysis across the site.
          </p>
          <form action="/search" className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search coverage"
              className="min-h-11 flex-1 rounded border border-[#00e8ff]/30 bg-[#080808] px-3 py-2 text-sm text-[#e0e0e0] outline-none focus:border-[#00e8ff]"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded border border-[#00e8ff]/40 bg-[#0a1118] px-4 py-2.5 text-sm font-medium text-[#00e8ff]"
            >
              Search
            </button>
          </form>
        </section>

        <HomeSection
          title={query ? `Results for "${query}"` : "Search results"}
          description={query ? `${results.length} story matches` : "Enter a search query to inspect Sypher coverage."}
        >
          {query ? (
            results.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {results.map((article) => (
                  <ArticleCard
                    key={article.id}
                    articleId={article.id}
                    href={`/news/${article.topic.category.slug}/${article.slug}`}
                    title={article.title}
                    summary={article.summary}
                    categoryName={article.topic.category.name}
                    createdAt={article.publishedAt || article.createdAt}
                    transparency={
                      article.articleAlignmentConfidence != null ? Math.round(article.articleAlignmentConfidence * 100) : null
                    }
                    coverImageUrl={article.coverImageUrl}
                    coverImageThumbnailUrl={article.coverImageThumbnailUrl}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-[#00e8ff]/25 bg-black/30 py-10 text-center text-sm text-[#666]">
                No stories matched that search.
              </p>
            )
          ) : (
            <p className="rounded-md border border-dashed border-[#00e8ff]/25 bg-black/30 py-10 text-center text-sm text-[#666]">
              Start with a keyword, category, or theme.
            </p>
          )}
        </HomeSection>
      </SiteContainer>
    </main>
  );
}
