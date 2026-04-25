"use client";

import { useCallback, useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArticleFeedCard } from "@/components/article-feed-card";
import { FeedCategorySelector } from "@/components/feed-category-selector";
import { Button } from "@/components/ui/button";
import { getFeedArticles, removeSavedArticle, saveArticleForLater } from "@/app/actions/feed";
import { LogOut, Settings, ChevronDown, Trash2, BookOpen, Bookmark, X } from "lucide-react";

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
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);
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

  const handleToggleSaved = useCallback(
    (articleId: number, nextSaved: boolean) => {
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
    },
    [articles],
  );

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
    <div className="min-h-screen">
      {/* Top header */}
      <header className="panel mb-6 flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bc13fe]">
            Sypher
          </p>
          <h1 className="text-neon-glow font-mono text-xl font-bold text-[#00e8ff] sm:text-2xl">
            /your-feed
          </h1>
          <p className="mt-0.5 font-mono text-xs text-[#555]">{userEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Saved drawer toggle */}
          <button
            type="button"
            onClick={() => setShowSavedDrawer((v) => !v)}
            className="relative flex min-h-9 items-center gap-1.5 rounded-md border border-[#bc13fe]/25 px-3 font-mono text-xs text-[#bc13fe]/80 transition hover:border-[#bc13fe]/50 hover:text-[#bc13fe] lg:hidden"
          >
            <Bookmark className="size-3.5" aria-hidden />
            Saved
            {savedArticles.length > 0 && (
              <span className="ml-0.5 rounded-full bg-[#bc13fe]/20 px-1.5 py-0.5 text-[10px] text-[#bc13fe]">
                {savedArticles.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowPrefs((v) => !v)}
            className="flex min-h-9 items-center gap-1.5 rounded-md border border-[#00e8ff]/25 px-3 font-mono text-xs text-[#c8c8c8] transition hover:border-[#00e8ff]/50 hover:text-[#00e8ff] lg:hidden"
          >
            <Settings className="size-3.5" aria-hidden />
            Categories
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/feed/login" })}
            className="flex min-h-9 items-center gap-1.5 rounded-md border border-[#333]/60 px-3 font-mono text-xs text-[#555] transition hover:border-[#555] hover:text-[#888]"
          >
            <LogOut className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Mobile saved drawer */}
      {showSavedDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <button
            type="button"
            aria-label="Close saved articles"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSavedDrawer(false)}
          />
          <aside className="relative z-10 flex w-80 max-w-[90vw] flex-col border-l border-[#bc13fe]/20 bg-[#070a12]">
            <div className="flex items-center justify-between border-b border-[#bc13fe]/15 px-5 py-4">
              <div>
                <h2 className="font-mono text-sm font-semibold text-[#bc13fe]">Saved articles</h2>
                <p className="mt-0.5 text-xs text-[#555]">{savedArticles.length} saved</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSavedDrawer(false)}
                className="rounded p-1 text-[#555] hover:text-[#e0e0e0]"
                aria-label="Close"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SavedArticlesList
                savedArticles={savedArticles}
                isSavingArticle={isSavingArticle}
                onRemove={removeFromSavedSection}
              />
            </div>
          </aside>
        </div>
      )}

      {/* 3-col layout on desktop */}
      <div className="lg:grid lg:grid-cols-[240px_1fr_256px] lg:items-start lg:gap-6">

        {/* Left rail: categories */}
        <aside className="hidden lg:block">
          <div className="panel sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <div className="border-b border-[#00e8ff]/10 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#444]">
                Categories
              </p>
              <p className="mt-0.5 text-xs text-[#666]">
                {initialPreferenceIds.length > 0
                  ? `${initialPreferenceIds.length} selected`
                  : "None selected — seeing all"}
              </p>
            </div>
            <div className="p-4">
              <FeedCategorySelector
                categories={categories}
                initialSelected={initialPreferenceIds}
                onSaved={handlePreferencesSaved}
              />
            </div>
          </div>
        </aside>

        {/* Center: feed */}
        <div className="min-w-0 space-y-4">
          {/* Mobile category panel */}
          {showPrefs && (
            <div className="panel px-5 py-6 sm:px-6 lg:hidden">
              <FeedCategorySelector
                categories={categories}
                initialSelected={initialPreferenceIds}
                onSaved={handlePreferencesSaved}
              />
            </div>
          )}

          {!showPrefs && articles.length === 0 && initialPreferenceIds.length > 0 && (
            <div className="rounded-lg border border-dashed border-[#00e8ff]/20 bg-black/30 py-16 text-center">
              <p className="text-sm text-[#666]">No articles in your selected categories yet.</p>
              <p className="mt-1 text-xs text-[#444]">
                New articles will appear here as they are published.
              </p>
            </div>
          )}

          {!showPrefs && articles.length > 0 && (
            <>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {articles.map((a, i) => (
                  <li
                    key={a.id}
                    className={`h-full ${
                      /* First card and every 7th after: hero spans full width */
                      i === 0 ? "sm:col-span-2" : ""
                    }`}
                  >
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
                  <Button onClick={loadMore} disabled={isLoadingMore} className="gap-1.5">
                    <ChevronDown className="size-4" aria-hidden />
                    {isLoadingMore ? "Loading…" : "Load more"}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Mobile: saved articles section below feed */}
          {!showPrefs && (
            <section className="pt-8 lg:hidden">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-mono text-base font-semibold text-[#bc13fe]">
                  Saved articles
                </h2>
                <span className="font-mono text-xs text-[#555]">{savedArticles.length}</span>
              </div>
              <SavedArticlesList
                savedArticles={savedArticles}
                isSavingArticle={isSavingArticle}
                onRemove={removeFromSavedSection}
              />
            </section>
          )}
        </div>

        {/* Right rail: saved articles — desktop only */}
        <aside className="hidden lg:block">
          <div className="panel sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#bc13fe]/15 px-5 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#bc13fe]/60">
                  Saved
                </p>
                <p className="mt-0.5 text-xs text-[#555]">
                  {savedArticles.length} {savedArticles.length === 1 ? "article" : "articles"}
                </p>
              </div>
              <Bookmark className="size-4 text-[#bc13fe]/40" aria-hidden />
            </div>
            <div className="py-1">
              <SavedArticlesList
                savedArticles={savedArticles}
                isSavingArticle={isSavingArticle}
                onRemove={removeFromSavedSection}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SavedArticlesList({
  savedArticles,
  isSavingArticle,
  onRemove,
}: {
  savedArticles: FeedArticle[];
  isSavingArticle: boolean;
  onRemove: (id: number) => void;
}) {
  if (savedArticles.length === 0) {
    return (
      <div className="py-8 text-center">
        <Bookmark className="mx-auto mb-2 size-6 text-[#333]" aria-hidden />
        <p className="text-xs text-[#555]">No saved articles yet.</p>
        <p className="mt-1 text-[11px] text-[#3a3a3a]">Tap the bookmark on any card.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#bc13fe]/8">
      {savedArticles.map((a) => (
        <li key={a.id} className="group px-5 py-3 transition hover:bg-white/2">
          <div className="min-w-0">
            <Link
              href={`/news/${a.topic.category.slug}/${a.slug}`}
              className="block truncate font-mono text-xs font-medium text-[#00e8ff] hover:underline"
            >
              {a.title}
            </Link>
            <p className="mt-0.5 text-[11px] text-[#555]">{a.topic.category.name}</p>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Link
              href={`/news/${a.topic.category.slug}/${a.slug}`}
              className="flex items-center gap-1 rounded border border-[#333] px-2 py-1 text-[11px] text-[#555] transition hover:border-[#555] hover:text-[#c8c8c8]"
            >
              <BookOpen className="size-3" aria-hidden />
              Read
            </Link>
            <button
              type="button"
              onClick={() => onRemove(a.id)}
              disabled={isSavingArticle}
              className="flex items-center gap-1 rounded border border-[#333] px-2 py-1 text-[11px] text-[#555] transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
            >
              <Trash2 className="size-3" aria-hidden />
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
