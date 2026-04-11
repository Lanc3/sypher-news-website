"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type HomeArticle = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  createdAt: string;
  categorySlug: string;
  categoryName: string;
  transparency: number | null;
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-lg border border-[#00ff41]/20 bg-black/40 p-4 font-mono text-sm md:flex-row md:flex-wrap md:items-end">
        <label className="flex flex-col gap-1 text-[#a0a0a0]">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded border border-[#00ff41]/30 bg-[#080808] px-2 py-2 text-[#e0e0e0]"
          >
            <option value="all">All</option>
            {categories.map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[#a0a0a0]">
          Min transparency (0–100)
          <input
            type="number"
            min={0}
            max={100}
            value={minTransparency}
            onChange={(e) => setMinTransparency(Number(e.target.value) || 0)}
            className="w-32 rounded border border-[#00ff41]/30 bg-[#080808] px-2 py-2 text-[#e0e0e0]"
          />
        </label>
        <label className="flex flex-col gap-1 text-[#a0a0a0]">
          From date
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded border border-[#00ff41]/30 bg-[#080808] px-2 py-2 text-[#e0e0e0]"
          />
        </label>
      </div>

      <ul className="space-y-6">
        {filtered.map((a) => (
          <li key={a.id} className="rounded-lg border border-[#00ff41]/15 bg-[#0a0a0a]/80 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#666]">
              <span className="text-[#ff2bd6]">{a.categoryName}</span>
              <span>{a.createdAt.slice(0, 10)}</span>
              {a.transparency != null ? (
                <span className="rounded border border-[#00ff41]/30 px-2 text-[#00ff41]">T:{a.transparency}</span>
              ) : null}
            </div>
            <Link href={`/news/${a.categorySlug}/${a.slug}`} className="mt-2 block font-mono text-xl text-[#00ff41] hover:underline">
              {a.title}
            </Link>
            {a.summary ? <p className="mt-2 text-sm text-[#9a9a9a]">{a.summary}</p> : null}
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="text-center text-sm text-[#666]">No articles match filters.</p> : null}
    </div>
  );
}
