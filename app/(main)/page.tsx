import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { ArticleCard } from "@/components/article-card";
import { HomeHero } from "@/components/home-hero";
import { HomeArticleFilters, type HomeArticle } from "@/components/home-article-filters";
import { SiteContainer } from "@/components/site-container";
import { getCountryArticleCounts, listHomepageSections } from "@/lib/article-public";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Disassemble the headline",
  description:
    "Sypher News uses AI-driven deep research to generate articles, categories, and topics from current global news as part of a fully automated news system.",
  openGraph: {
    title: "Sypher News",
    description: "AI-generated deep-research coverage built toward a fully automated news system.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sypher News",
    description: "AI-generated deep-research coverage built toward a fully automated news system.",
  },
};

export default async function HomePage() {
  const [session, { featured, latest, categoryGroups }, countryArticleCounts] = await Promise.all([
    auth(),
    listHomepageSections(),
    getCountryArticleCounts(),
  ]);
  const hasSignedInUser = Boolean(session?.user);
  const articles: HomeArticle[] = latest
    .filter((a) => a.topic?.category)
    .map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      createdAt: (a.publishedAt || a.createdAt).toISOString(),
      categorySlug: a.topic!.category!.slug,
      categoryName: a.topic!.category!.name,
      transparency:
        a.articleAlignmentConfidence != null ? Math.round(a.articleAlignmentConfidence * 100) : null,
      coverImageUrl: a.coverImageUrl,
      coverImageThumbnailUrl: a.coverImageThumbnailUrl,
    }));

  return (
    <main id="main-content" className="flex-1 py-8 sm:py-10 lg:py-12">
      <SiteContainer max="lg" className="space-y-10 sm:space-y-12 lg:space-y-14">

        {/* Hero — asymmetric 2-col on desktop */}
        <HomeHero countryArticleCounts={countryArticleCounts} />

        {/* Featured — editorial mosaic */}
        {featured.length > 0 ? (
          <section className="space-y-4">
            <SectionHeader eyebrow="Featured" title="Lead signals" />
            {featured.length === 1 ? (
              <ArticleCard
                articleId={featured[0].id}
                href={`/news/${featured[0].topic.category.slug}/${featured[0].slug}`}
                title={featured[0].title}
                summary={featured[0].summary}
                categoryName={featured[0].topic.category.name}
                createdAt={featured[0].publishedAt || featured[0].createdAt}
                transparency={
                  featured[0].articleAlignmentConfidence != null
                    ? Math.round(featured[0].articleAlignmentConfidence * 100)
                    : null
                }
                coverImageUrl={featured[0].coverImageUrl}
                coverImageThumbnailUrl={featured[0].coverImageThumbnailUrl}
                featured
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {/* Lead article — 2 cols wide */}
                <div className="md:col-span-2">
                  <ArticleCard
                    articleId={featured[0].id}
                    href={`/news/${featured[0].topic.category.slug}/${featured[0].slug}`}
                    title={featured[0].title}
                    summary={featured[0].summary}
                    categoryName={featured[0].topic.category.name}
                    createdAt={featured[0].publishedAt || featured[0].createdAt}
                    transparency={
                      featured[0].articleAlignmentConfidence != null
                        ? Math.round(featured[0].articleAlignmentConfidence * 100)
                        : null
                    }
                    coverImageUrl={featured[0].coverImageUrl}
                    coverImageThumbnailUrl={featured[0].coverImageThumbnailUrl}
                    featured
                  />
                </div>
                {/* Supporting articles stacked */}
                <div className="flex flex-col gap-4">
                  {featured.slice(1, 3).map((article) => (
                    <ArticleCard
                      key={article.id}
                      articleId={article.id}
                      href={`/news/${article.topic.category.slug}/${article.slug}`}
                      title={article.title}
                      summary={article.summary}
                      categoryName={article.topic.category.name}
                      createdAt={article.publishedAt || article.createdAt}
                      transparency={
                        article.articleAlignmentConfidence != null
                          ? Math.round(article.articleAlignmentConfidence * 100)
                          : null
                      }
                      coverImageUrl={article.coverImageUrl}
                      coverImageThumbnailUrl={article.coverImageThumbnailUrl}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : null}

        <hr className="border-[#00e8ff]/8" />

        {/* Latest wire + personalization CTA — 2-col split on desktop */}
        <section className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start lg:gap-10">
          <div className="space-y-4 min-w-0">
            <SectionHeader eyebrow="Wire" title="Latest wire" />
            <HomeArticleFilters articles={articles} />
          </div>

          {/* Personalization rail — sticky on desktop */}
          <aside className="lg:sticky lg:top-8">
            <div className="panel p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#bc13fe]">
                {hasSignedInUser ? "Your feed" : "Personalize"}
              </p>
              <p className="mt-3 font-mono text-base font-semibold text-[#f5f7ff]">
                {hasSignedInUser
                  ? "Your personalized feed is ready."
                  : "Build your custom news feed."}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#9aa3c7]">
                {hasSignedInUser
                  ? "Open your feed to continue with the topics and categories you already selected."
                  : "Save your preferences and get a personalized stream instead of a one-size-fits-all wire."}
              </p>
              <Link
                href={hasSignedInUser ? "/feed" : "/feed/register"}
                className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-[#00e8ff]/60 bg-[#00e8ff]/10 px-4 py-2.5 text-sm font-medium text-[#00e8ff] transition hover:bg-[#00e8ff]/20"
              >
                {hasSignedInUser ? "Go to your feed" : "Sign up for a custom feed"}
              </Link>
            </div>

            {/* Global newsroom promo */}
            <div className="panel mt-4 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#00e8ff]/60">
                Global
              </p>
              <p className="mt-2 text-sm font-medium text-[#d0d0d0]">
                Explore news by country
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#666]">
                Select any country on the globe to see all published coverage from that region.
              </p>
              <Link
                href="/global-newsroom"
                className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-[#bc13fe]/40 bg-[#bc13fe]/10 px-4 py-2 text-sm text-[#bc13fe] transition hover:bg-[#bc13fe]/20"
              >
                Open global newsroom
              </Link>
            </div>
          </aside>
        </section>

        {/* Category channels — horizontal scroll rails */}
        {categoryGroups.length > 0 ? (
          <section className="space-y-6">
            <SectionHeader eyebrow="Channels" title="Featured by category" />
            <div className="space-y-8">
              {categoryGroups.map((group) => (
                <div key={group.category.id}>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-magenta-glow font-mono text-lg font-bold tracking-tight text-[#bc13fe] sm:text-xl">
                        {group.category.name}
                      </p>
                      {group.category.description ? (
                        <p className="mt-0.5 text-xs text-[#555]">{group.category.description}</p>
                      ) : null}
                    </div>
                    <Link
                      href={`/news/${group.category.slug}`}
                      className="shrink-0 text-xs text-[#00e8ff] hover:underline"
                    >
                      View all →
                    </Link>
                  </div>
                  {/* Horizontal scroll rail */}
                  <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
                    {group.articles.map((article) => (
                      <div
                        key={article.id}
                        className="w-[260px] shrink-0 snap-start sm:w-[300px]"
                      >
                        <ArticleCard
                          articleId={article.id}
                          href={`/news/${article.topic.category.slug}/${article.slug}`}
                          title={article.title}
                          summary={article.summary}
                          categoryName={article.topic.category.name}
                          createdAt={article.publishedAt || article.createdAt}
                          transparency={
                            article.articleAlignmentConfidence != null
                              ? Math.round(article.articleAlignmentConfidence * 100)
                              : null
                          }
                          coverImageUrl={article.coverImageUrl}
                          coverImageThumbnailUrl={article.coverImageThumbnailUrl}
                          compact
                        />
                      </div>
                    ))}
                    {/* Peek edge — more indicator */}
                    <div className="w-8 shrink-0" aria-hidden />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

      </SiteContainer>
    </main>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div>
      {eyebrow ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#bc13fe] sm:text-xs">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-1 font-mono text-lg font-semibold tracking-wide text-[#e8e8e8] sm:text-xl">
        {title}
      </h2>
    </div>
  );
}
