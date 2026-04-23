import { ArticleCard } from "@/components/article-card";
import type { PublicArticle } from "@/lib/article-public";

export function RelatedArticles({ articles }: { articles: PublicArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-[#e0e0e0]/70 sm:text-sm">Next read</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {articles.map((article) => (
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
    </section>
  );
}
