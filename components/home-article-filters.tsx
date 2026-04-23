"use client";

import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/article-card";

export type HomeArticle = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  createdAt: string;
  categorySlug: string;
  categoryName: string;
  transparency: number | null;
  coverImageUrl?: string | null;
  coverImageThumbnailUrl?: string | null;
};

export function HomeArticleFilters({ articles }: { articles: HomeArticle[] }) {
  const [category, setCategory] = useState<string>("all");
  const [minTransparency, setMinTransparency] = useState(0);
  const [fromDate, setFromDate] = useState("");

  const categories = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of articles) m.set(a.categorySlug, a.categoryName);
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (category !== "all" && a.categorySlug !== category) return false;
      if (minTransparency > 0) {
        const t = a.transparency ?? 0;
        if (t < minTransparency) return false;
      }
      if (fromDate) {
        const d = new Date(a.createdAt);
        const min = new Date(fromDate);
        if (d < min) return false;
      }
      return true;
    });
  }, [articles, category, minTransparency, fromDate]);

  const inputClass =
    "min-h-11 w-full rounded-md border border-[#00e8ff]/30 bg-[#080808] px-3 py-2 text-sm text-[#e0e0e0] shadow-inner shadow-black/40 transition focus:border-[#00e8ff]/60 focus:outline-none focus:ring-1 focus:ring-[#00e8ff]/40";

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="panel p-4 sm:p-5">
        <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-widest text-[#00e8ff]/60 sm:mb-4">
          Filters
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-2 text-xs font-medium text-[#a0a0a0] sm:text-sm">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              <option value="all">All</option>
              {categories.map(([slug, name]) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs font-medium text-[#a0a0a0] sm:text-sm">
            Min transparency (0–100)
            <input
              type="number"
              min={0}
              max={100}
              value={minTransparency}
              onChange={(e) => setMinTransparency(Number(e.target.value) || 0)}
              className={`${inputClass} sm:max-w-none`}
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-medium text-[#a0a0a0] sm:col-span-2 sm:text-sm lg:col-span-1">
            From date
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        {filtered.map((a) => (
          <li key={a.id}>
            <ArticleCard
              href={`/news/${a.categorySlug}/${a.slug}`}
              title={a.title}
              summary={a.summary}
              categoryName={a.categoryName}
              createdAt={a.createdAt}
              transparency={a.transparency}
              coverImageUrl={a.coverImageUrl}
              coverImageThumbnailUrl={a.coverImageThumbnailUrl}
            />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed border-[#00e8ff]/25 bg-black/30 py-10 text-center text-sm text-[#666]">
          No articles match filters.
        </p>
      ) : null}
    </div>
  );
}
