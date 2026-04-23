import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { SiteContainer } from "@/components/site-container";
import { getAuthorArchive } from "@/lib/article-public";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorArchive(slug);
  if (!author) return { title: "Author" };
  return {
    title: author.name,
    description: author.bio || `Read reporting and analysis by ${author.name} on Sypher News.`,
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthorArchive(slug);
  if (!author) notFound();

  return (
    <main id="main-content" className="flex-1 py-10 sm:py-14">
      <SiteContainer max="lg" className="space-y-8">
        <section className="panel px-5 py-8 sm:px-8 sm:py-10">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-[#bc13fe] sm:text-xs">Author</p>
          <h1 className="mt-3 font-mono text-2xl font-bold tracking-tight text-[#00e8ff] sm:text-3xl">{author.name}</h1>
          {author.title ? <p className="mt-2 text-sm text-[#bc13fe]">{author.title}</p> : null}
          {author.bio ? <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#b0b0b0] sm:text-base">{author.bio}</p> : null}
        </section>

        <section className="space-y-4">
          <h2 className="font-mono text-lg text-[#e0e0e0]">Recent stories</h2>
          {author.articles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {author.articles.map((article) => (
                <ArticleCard
                  key={article.id}
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
            <p className="text-sm text-[#666]">No published stories from this author yet.</p>
          )}
        </section>
      </SiteContainer>
    </main>
  );
}
