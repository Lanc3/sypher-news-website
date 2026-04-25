"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  Activity,
  BadgeDollarSign,
  Building2,
  Clapperboard,
  FlaskConical,
  Gavel,
  Globe2,
  GraduationCap,
  HeartPulse,
  Landmark,
  Loader2,
  type LucideIcon,
  MonitorPlay,
  Newspaper,
  Scale,
  Shield,
  Sparkles,
  Sprout,
  Tag,
  Trophy,
  Users,
} from "lucide-react";
import { ArticleCard } from "@/components/article-card";

type CategoryOption = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  topicCount: number;
};

type ArticleData = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  publishedAt: string | null;
  createdAt: string;
  articleAlignmentConfidence: number | null;
  featured: boolean;
  categorySlug: string;
  categoryName: string;
  coverImageUrl: string | null;
  coverImageThumbnailUrl: string | null;
};

const ICON_RULES: Array<{ test: RegExp; icon: LucideIcon }> = [
  { test: /(world|global|international)/i, icon: Globe2 },
  { test: /(politics|policy|government)/i, icon: Landmark },
  { test: /(justice|law|legal|court)/i, icon: Scale },
  { test: /(crime|security|defense|military)/i, icon: Shield },
  { test: /(business|economy|finance|market)/i, icon: BadgeDollarSign },
  { test: /(tech|technology|ai|cyber)/i, icon: Sparkles },
  { test: /(science|research)/i, icon: FlaskConical },
  { test: /(health|medical)/i, icon: HeartPulse },
  { test: /(climate|environment|energy)/i, icon: Sprout },
  { test: /(education|school)/i, icon: GraduationCap },
  { test: /(culture|media|entertainment)/i, icon: Clapperboard },
  { test: /(sports|sport)/i, icon: Trophy },
  { test: /(society|community|people)/i, icon: Users },
  { test: /(war|conflict|geopolitics)/i, icon: Gavel },
  { test: /(opinion|analysis)/i, icon: Activity },
  { test: /(video|stream|watch)/i, icon: MonitorPlay },
  { test: /(nation|state|country)/i, icon: Building2 },
];

function getCategoryIcon(category: CategoryOption): LucideIcon {
  const haystack = `${category.slug} ${category.name}`;
  for (const rule of ICON_RULES) {
    if (rule.test.test(haystack)) return rule.icon;
  }
  return Newspaper;
}

function toTimestamp(article: ArticleData) {
  return new Date(article.publishedAt || article.createdAt).getTime();
}

export function NewsCategoryFeed({
  categories,
  hasSignedInUser,
}: {
  categories: CategoryOption[];
  hasSignedInUser: boolean;
}) {
  const [activeCategorySlugs, setActiveCategorySlugs] = useState<string[]>([]);
  const [articlesByCategory, setArticlesByCategory] = useState<Record<string, ArticleData[]>>({});
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState<string | null>(null);
  const [isFetching, startFetch] = useTransition();
  const [loadingSlugs, setLoadingSlugs] = useState<string[]>([]);

  const hoveredCategory = useMemo(
    () => categories.find((category) => category.slug === hoveredCategorySlug) || null,
    [categories, hoveredCategorySlug],
  );

  const visibleArticles = useMemo(() => {
    const deduped = new Map<number, ArticleData>();
    for (const slug of activeCategorySlugs) {
      const articles = articlesByCategory[slug] || [];
      for (const article of articles) {
        if (!deduped.has(article.id)) {
          deduped.set(article.id, article);
        }
      }
    }
    return Array.from(deduped.values()).sort((a, b) => toTimestamp(b) - toTimestamp(a));
  }, [activeCategorySlugs, articlesByCategory]);

  const toggleCategory = (categorySlug: string) => {
    const isActive = activeCategorySlugs.includes(categorySlug);

    setActiveCategorySlugs((prev) =>
      prev.includes(categorySlug) ? prev.filter((slug) => slug !== categorySlug) : [...prev, categorySlug],
    );

    if (isActive || articlesByCategory[categorySlug]) {
      return;
    }

    startFetch(async () => {
      setLoadingSlugs((prev) => [...prev, categorySlug]);
      try {
        const response = await fetch(`/api/global-newsroom/articles?category=${encodeURIComponent(categorySlug)}`);
        if (!response.ok) {
          setArticlesByCategory((prev) => ({ ...prev, [categorySlug]: [] }));
          return;
        }
        const data = (await response.json()) as { articles?: ArticleData[] };
        setArticlesByCategory((prev) => ({ ...prev, [categorySlug]: data.articles || [] }));
      } catch {
        setArticlesByCategory((prev) => ({ ...prev, [categorySlug]: [] }));
      } finally {
        setLoadingSlugs((prev) => prev.filter((slug) => slug !== categorySlug));
      }
    });
  };

  const loadingLabel =
    loadingSlugs.length > 0 ? `Loading ${loadingSlugs.length} channel${loadingSlugs.length > 1 ? "s" : ""}...` : null;

  return (
    <div className="space-y-8">
      <section className="panel px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-[#bc13fe] sm:text-xs">
              Channels
            </p>
            <h1 className="mt-2 font-mono text-2xl font-bold tracking-tight text-[#00e8ff] sm:text-3xl">/news</h1>
          </div>
          {loadingLabel ? (
            <p className="inline-flex items-center gap-2 text-xs text-[#00e8ff]/80 sm:text-sm">
              <Loader2 className="size-4 animate-spin" />
              {loadingLabel}
            </p>
          ) : null}
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#9a9a9a] sm:text-base">
          Toggle one or more channels to build a live wire below. Hover any icon to preview what that category covers.
        </p>

        <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category);
            const isActive = activeCategorySlugs.includes(category.slug);
            const isLoading = loadingSlugs.includes(category.slug);

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.slug)}
                onMouseEnter={() => setHoveredCategorySlug(category.slug)}
                onMouseLeave={() => setHoveredCategorySlug(null)}
                onFocus={() => setHoveredCategorySlug(category.slug)}
                onBlur={() => setHoveredCategorySlug(null)}
                aria-pressed={isActive}
                title={category.description || `${category.name} coverage`}
                className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-sm transition sm:px-3.5 ${
                  isActive
                    ? "border-[#00e8ff]/80 bg-[#00e8ff]/20 text-[#00e8ff]"
                    : "border-[#00e8ff]/25 bg-black/40 text-[#9aa3c7] hover:border-[#00e8ff]/50 hover:text-[#dbe2ff]"
                }`}
              >
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" aria-hidden />}
                <span className="font-mono text-xs uppercase tracking-[0.18em]">{category.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-md border border-[#00e8ff]/15 bg-black/30 px-4 py-3">
          {hoveredCategory ? (
            <p className="text-sm text-[#b6bfdf]">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#00e8ff]">{hoveredCategory.name}</span>
              <span className="mx-2 text-[#00e8ff]/40">|</span>
              {hoveredCategory.description || "No description set for this channel yet."}
            </p>
          ) : (
            <p className="text-sm text-[#777]">Hover over a channel icon to preview its description.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-mono text-xl font-semibold text-[#00e8ff] sm:text-2xl">Live article wire</h2>
          {activeCategorySlugs.length > 0 ? (
            <p className="text-xs text-[#888] sm:text-sm">
              {activeCategorySlugs.length} active channel{activeCategorySlugs.length > 1 ? "s" : ""} |{" "}
              {visibleArticles.length} article{visibleArticles.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        {activeCategorySlugs.length === 0 ? (
          <div className="rounded-md border border-dashed border-[#00e8ff]/25 bg-black/30 py-10 text-center text-sm text-[#777]">
            Select at least one category icon to populate the article list.
          </div>
        ) : null}

        {activeCategorySlugs.length > 0 && visibleArticles.length === 0 && !isFetching ? (
          <div className="rounded-md border border-dashed border-[#00e8ff]/25 bg-black/30 py-10 text-center text-sm text-[#777]">
            No articles yet for the selected categories.
          </div>
        ) : null}

        {visibleArticles.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleArticles.map((article) => (
              <li key={article.id}>
                <ArticleCard
                  articleId={article.id}
                  href={`/news/${article.categorySlug}/${article.slug}`}
                  title={article.title}
                  summary={article.summary}
                  categoryName={article.categoryName}
                  createdAt={article.publishedAt || article.createdAt}
                  transparency={
                    article.articleAlignmentConfidence != null
                      ? Math.round(article.articleAlignmentConfidence * 100)
                      : null
                  }
                  featured={article.featured}
                  coverImageUrl={article.coverImageUrl}
                  coverImageThumbnailUrl={article.coverImageThumbnailUrl}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-base text-[#f5f7ff] sm:text-lg">
              {hasSignedInUser ? "Your custom feed is ready" : "Build your custom news feed"}
            </p>
            <p className="text-sm text-[#9aa3c7]">
              {hasSignedInUser
                ? "Open your feed to continue with the categories and topics you already selected."
                : "Sign up to save your preferences and get a personalized stream instead of a one-size-fits-all wire."}
            </p>
          </div>
          <Link
            href={hasSignedInUser ? "/feed" : "/feed/register"}
            className="inline-flex items-center justify-center rounded-md border border-[#00e8ff]/60 bg-[#00e8ff]/10 px-4 py-2 text-sm font-medium text-[#00e8ff] transition hover:bg-[#00e8ff]/20"
          >
            {hasSignedInUser ? "Go to your feed" : "Sign up for a custom feed"}
          </Link>
        </div>
      </section>
    </div>
  );
}
