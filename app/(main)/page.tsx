import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { HomeHero } from "@/components/home-hero";
import { HomeSection } from "@/components/home-section";
import { HomeArticleFilters, type HomeArticle } from "@/components/home-article-filters";
import { SiteContainer } from "@/components/site-container";
import { listHomepageSections } from "@/lib/article-public";

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
  const { featured, latest, categoryGroups } = await listHomepageSections();
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
    }));

  return (
    <main id="main-content" className="flex-1 py-10 sm:py-14 lg:py-16">
      <SiteContainer max="lg" className="space-y-12 sm:space-y-16 lg:space-y-20">
        <HomeHero />

        {featured.length > 0 ? (
          <HomeSection
            eyebrow="Featured"
            title="Lead signals"
            description="Top stories and analysis chosen to show where narrative framing, sourcing, or bias pressure are most worth inspecting."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {featured.map((article) => (
                <ArticleCard
                  key={article.id}
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
                  featured
                />
              ))}
            </div>
          </HomeSection>
        ) : null}

        {categoryGroups.length > 0 ? (
          <HomeSection
            eyebrow="Channels"
            title="Featured by category"
            description="Quick access to the latest reporting by channel without losing the story hierarchy."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              {categoryGroups.map((group) => (
                <div key={group.category.id} className="panel p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-magenta-glow font-mono text-lg font-bold tracking-tight text-[#bc13fe] sm:text-xl">
                        {group.category.name}
                      </p>
                      {group.category.description ? (
                        <p className="mt-1 text-sm text-[#777]">{group.category.description}</p>
                      ) : null}
                    </div>
                    <Link href={`/news/${group.category.slug}`} className="text-xs text-[#00e8ff] hover:underline">
                      View channel
                    </Link>
                  </div>
                  <div className="grid gap-4">
                    {group.articles.map((article) => (
                      <ArticleCard
                        key={article.id}
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
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </HomeSection>
        ) : null}

        <HomeSection
          eyebrow="Wire"
          title="Latest wire"
          description="Filter the latest AI-generated stories produced through deep research on current news across the globe."
        >
          <HomeArticleFilters articles={articles} />
        </HomeSection>
      </SiteContainer>
    </main>
  );
}
