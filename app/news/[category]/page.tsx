import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article-card";
import { SiteContainer } from "@/components/site-container";
import { listArticlesByCategorySlug } from "@/lib/article-public";

export const revalidate = 60;

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    return { title: "Category" };
  }
  return {
    title: `${category.name} news`,
    description: category.description || `Read the latest ${category.name} reporting and analysis on Sypher News.`,
  };
}

export default async function CategoryArticlesPage({ params }: Props) {
  const { category: categorySlug } = await params;
  let category = null as Awaited<ReturnType<typeof prisma.category.findUnique>>;
  try {
    category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
  } catch {
    category = null;
  }
  if (!category) notFound();

  const articles = await listArticlesByCategorySlug(category.slug, 100);

  return (
    <main id="main-content" className="flex-1 py-10 sm:py-14">
      <SiteContainer max="md">
        <header className="panel px-5 py-6 sm:px-8 sm:py-8">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-[#bc13fe] sm:text-xs">Category</p>
          <h1 className="mt-2 font-mono text-2xl font-bold tracking-tight text-[#00e8ff] sm:text-3xl lg:text-4xl">{category.name}</h1>
          {category.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#9a9a9a] sm:text-base">{category.description}</p>
          ) : null}
        </header>

        <ul className="mt-8 space-y-3 sm:mt-10 sm:space-y-4">
          {articles.map((a) => (
            <li key={a.id}>
              <ArticleCard
                href={`/news/${category.slug}/${a.slug}`}
                title={a.title}
                summary={a.summary}
                categoryName={category.name}
                createdAt={a.publishedAt || a.createdAt}
                transparency={a.articleAlignmentConfidence != null ? Math.round(a.articleAlignmentConfidence * 100) : null}
                coverImageUrl={a.coverImageUrl}
                coverImageThumbnailUrl={a.coverImageThumbnailUrl}
              />
            </li>
          ))}
        </ul>
        {articles.length === 0 ? (
          <p className="mt-8 rounded-md border border-dashed border-[#00e8ff]/25 bg-black/30 py-10 text-center text-sm text-[#666] sm:mt-10">
            No articles in this channel yet.
          </p>
        ) : null}
      </SiteContainer>
    </main>
  );
}
