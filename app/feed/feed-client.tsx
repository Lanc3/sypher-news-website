"use client";

import { useCallback, useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArticleFeedCard } from "@/components/article-feed-card";
import { FeedCategorySelector } from "@/components/feed-category-selector";
import { Button } from "@/components/ui/button";
import { getFeedArticles, removeSavedArticle, saveArticleForLater } from "@/app/actions/feed";
import { LogOut, Settings, ChevronDown, Trash2, BookOpen } from "lucide-react";

type Category = { id: number; slug: string; name: string; description: string | null };

type FeedArticle = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  articleAlignmentConfidence: number | null;
  featured: boolean;
  coverImageUrl: string | null;
  coverImageThumbnailUrl: string | null;
  topic: { category: { slug: string; name: string } };
};

export function FeedClient({
  userEmail,
  categories,
  initialPreferenceIds,
  initialArticles,
  initialTotal,
  initialSavedArticleIds,
  initialSavedArticles,
}: {
  userEmail: string;
  categories: Category[];
  initialPreferenceIds: number[];
  initialArticles: FeedArticle[];
  initialTotal: number;
  initialSavedArticleIds: number[];
  initialSavedArticles: FeedArticle[];
}) {
  const router = useRouter();
  const [showPrefs, setShowPrefs] = useState(initialPreferenceIds.length === 0);
  const [articles, setArticles] = useState(initialArticles);
  const [total, setTotal] = useState(initialTotal);
  const [savedArticleIds, setSavedArticleIds] = useState<Set<number>>(new Set(initialSavedArticleIds));
  const [savedArticles, setSavedArticles] = useState(initialSavedArticles);
  const [page, setPage] = useState(1);
  const [isLoadingMore, startLoadMore] = useTransition();
  const [isSavingArticle, startSaveArticle] = useTransition();

  const handlePreferencesSaved = useCallback(() => {
    setShowPrefs(false);
    router.refresh();
  }, [router]);

  const loadMore = useCallback(() => {
    startLoadMore(async () => {
      const nextPage = page + 1;
      const data = await getFeedArticles(nextPage, 30);
      setArticles((prev) => [...prev, ...data.articles]);
      setTotal(data.total);
      setPage(nextPage);
    });
  }, [page]);

  const hasMore = articles.length < total;

  const handleToggleSaved = useCallback((articleId: number, nextSaved: boolean) => {
    startSaveArticle(async () => {
      if (nextSaved) {
        await saveArticleForLater(articleId);
        setSavedArticleIds((prev) => {
          const next = new Set(prev);
          next.add(articleId);
          return next;
        });
        setSavedArticles((prev) => {
          if (prev.some((item) => item.id === articleId)) return prev;
          const fromFeed = articles.find((item) => item.id === articleId);
          if (!fromFeed) return prev;
          return [fromFeed, ...prev];
        });
      } else {
        await removeSavedArticle(articleId);
        setSavedArticleIds((prev) => {
          const next = new Set(prev);
          next.delete(articleId);
          return next;
        });
        setSavedArticles((prev) => prev.filter((item) => item.id !== articleId));
      }
    });
  }, [articles]);

  const removeFromSavedSection = useCallback((articleId: number) => {
    startSaveArticle(async () => {
      await removeSavedArticle(articleId);
      setSavedArticleIds((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
      setSavedArticles((prev) => prev.filter((item) => item.id !== articleId));
    });
  }, []);

  return (
    <div className="space-y-6">
      <header className="panel flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div>
          <h1 className="text-neon-glow font-mono text-xl font-bold text-[#00e8ff] sm:text-2xl">
            /your-feed
          </h1>
          <p className="mt-1 font-mono text-xs text-[#888]">{userEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPrefs((v) => !v)}
            className="flex min-h-9 items-center gap-1.5 rounded-md border border-[#00e8ff]/25 px-3 font-mono text-xs text-[#c8c8c8] transition hover:border-[#00e8ff]/50 hover:text-[#00e8ff]"
          >
            <Settings className="size-3.5" aria-hidden />
            Categories
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/feed/login" })}
            className="flex min-h-9 items-center gap-1.5 rounded-md border border-[#bc13fe]/25 px-3 font-mono text-xs text-[#bc13fe]/80 transition hover:border-[#bc13fe]/50 hover:text-[#bc13fe]"
          >
            <LogOut className="size-3.5" aria-hidden />
            Sign out
          </button>
        </div>
      </header>

      {showPrefs && (
        <div className="panel px-5 py-6 sm:px-6">
          <FeedCategorySelector
            categories={categories}
            initialSelected={initialPreferenceIds}
            onSaved={handlePreferencesSaved}
          />
        </div>
      )}

      {!showPrefs && articles.length === 0 && initialPreferenceIds.length > 0 && (
        <div className="rounded-md border border-dashed border-[#00e8ff]/25 bg-black/30 py-12 text-center">
          <p className="text-sm text-[#888]">No articles in your selected categories yet.</p>
          <p className="mt-1 text-xs text-[#666]">
            New articles will appear here as they are published.
          </p>
        </div>
      )}

      {!showPrefs && articles.length > 0 && (
        <>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {articles.map((a) => (
              <li key={a.id} className="h-full">
                <ArticleFeedCard
                  articleId={a.id}
                  href={`/news/${a.topic.category.slug}/${a.slug}`}
                  title={a.title}
                  summary={a.summary}
                  categoryName={a.topic.category.name}
                  createdAt={a.publishedAt || a.createdAt}
                  transparency={
                    a.articleAlignmentConfidence != null
                      ? Math.round(a.articleAlignmentConfidence * 100)
                      : null
                  }
                  coverImageUrl={a.coverImageUrl}
                  coverImageThumbnailUrl={a.coverImageThumbnailUrl}
                  isSaved={savedArticleIds.has(a.id)}
                  onToggleSave={handleToggleSaved}
                />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="gap-1.5"
              >
                <ChevronDown className="size-4" aria-hidden />
                {isLoadingMore ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}

          <section className="pt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-mono text-base font-semibold text-[#00e8ff] sm:text-lg">
                Saved Articles
              </h2>
              <span className="font-mono text-xs text-[#666]">{savedArticles.length}</span>
            </div>

            {savedArticles.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#bc13fe]/25 bg-black/30 py-8 text-center">
                <p className="text-sm text-[#888]">No saved articles yet.</p>
                <p className="mt-1 text-xs text-[#666]">Use the bookmark icon on any feed card to save articles here.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {savedArticles.map((a) => (
                  <li key={a.id} className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-sm text-[#00e8ff]">{a.title}</p>
                      <p className="mt-1 text-xs text-[#888]">{a.topic.category.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/news/${a.topic.category.slug}/${a.slug}`}
                        className="inline-flex items-center gap-1 rounded-md border border-[#00e8ff]/25 px-2.5 py-1.5 font-mono text-xs text-[#c8c8c8] transition hover:border-[#00e8ff]/50 hover:text-[#00e8ff]"
                      >
                        <BookOpen className="size-3.5" aria-hidden />
                        Read article
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromSavedSection(a.id)}
                        disabled={isSavingArticle}
                        className="inline-flex items-center gap-1 rounded-md border border-[#bc13fe]/25 px-2.5 py-1.5 font-mono text-xs text-[#bc13fe]/85 transition hover:border-[#bc13fe]/55 hover:text-[#bc13fe] disabled:opacity-60"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
