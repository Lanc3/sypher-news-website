"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { ArticleCard } from "@/components/article-card";
import { CountryListPanel } from "@/components/country-list-panel";
import { COUNTRIES, CODE_TO_COUNTRY, SLUG_TO_COUNTRY } from "@/lib/countries";
import { Globe as GlobeIcon, Loader2 } from "lucide-react";

const GlobeView = dynamic(() => import("@/components/globe-view").then((m) => ({ default: m.GlobeView })), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-square max-w-[520px] mx-auto items-center justify-center">
      <Loader2 className="size-8 animate-spin text-[#00e8ff]/40" />
    </div>
  ),
});

type CategoryData = {
  id: number;
  slug: string;
  name: string;
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
};

export function GlobalNewsroomClient({
  countryCategories,
}: {
  countryCategories: CategoryData[];
}) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [isFetching, startFetch] = useTransition();
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);

  const countryCategoryMap = useMemo(() => {
    const map = new Map<string, CategoryData>();
    for (const cat of countryCategories) {
      const entry = SLUG_TO_COUNTRY.get(cat.slug);
      if (entry) map.set(entry.code, cat);
    }
    return map;
  }, [countryCategories]);

  const countriesWithArticles = useMemo(
    () => new Set(countryCategoryMap.keys()),
    [countryCategoryMap],
  );

  const countryListItems = useMemo(() => {
    return COUNTRIES.map((c) => {
      const cat = countryCategoryMap.get(c.code);
      return {
        code: c.code,
        name: c.name,
        slug: cat?.slug || null,
        hasArticles: !!cat,
      };
    }).sort((a, b) => {
      if (a.hasArticles !== b.hasArticles) return a.hasArticles ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [countryCategoryMap]);

  const handleCountrySelect = useCallback(
    (code: string) => {
      setSelectedCode(code);
      const entry = CODE_TO_COUNTRY.get(code);
      setSelectedCountryName(entry?.name || null);

      const cat = countryCategoryMap.get(code);
      if (!cat) {
        setArticles([]);
        return;
      }

      startFetch(async () => {
        try {
          const res = await fetch(`/api/global-newsroom/articles?category=${cat.slug}`);
          if (!res.ok) {
            setArticles([]);
            return;
          }
          const data = await res.json();
          setArticles(data.articles || []);
        } catch {
          setArticles([]);
        }
      });
    },
    [countryCategoryMap],
  );

  return (
    <div className="space-y-6">
      <header className="panel px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center gap-2">
          <GlobeIcon className="size-5 text-[#00e8ff]" aria-hidden />
          <h1 className="text-neon-glow font-mono text-xl font-bold text-[#00e8ff] sm:text-2xl">
            /global-newsroom
          </h1>
        </div>
        <p className="mt-2 text-sm text-[#888]">
          Select a country from the globe or list to explore news coverage from around the world.
        </p>
        {hoveredName && !selectedCode && (
          <p className="mt-2 font-mono text-xs text-[#00e8ff]/70">{hoveredName}</p>
        )}
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <div className="flex-1 min-w-0">
          <div className="panel overflow-hidden p-2 sm:p-4">
            <GlobeView
              countriesWithArticles={countriesWithArticles}
              selectedCode={selectedCode}
              onCountryClick={handleCountrySelect}
              onCountryHover={setHoveredName}
            />
          </div>
        </div>

        <div className="panel h-[360px] w-full overflow-hidden lg:h-[520px] lg:w-[260px] lg:shrink-0">
          <CountryListPanel
            countries={countryListItems}
            selectedCode={selectedCode}
            onSelect={handleCountrySelect}
          />
        </div>
      </div>

      {selectedCode && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-lg font-semibold text-[#00e8ff] sm:text-xl">
              {selectedCountryName}
            </h2>
            {isFetching && <Loader2 className="size-4 animate-spin text-[#00e8ff]/50" />}
          </div>

          {!isFetching && articles.length === 0 && (
            <div className="rounded-md border border-dashed border-[#00e8ff]/25 bg-black/30 py-10 text-center">
              <p className="text-sm text-[#888]">
                No articles yet for {selectedCountryName}.
              </p>
              <p className="mt-1 text-xs text-[#666]">
                Articles will appear here when coverage is published for this country.
              </p>
            </div>
          )}

          {articles.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {articles.map((a) => (
                <li key={a.id}>
                  <ArticleCard
                    href={`/news/${a.categorySlug}/${a.slug}`}
                    title={a.title}
                    summary={a.summary}
                    categoryName={a.categoryName}
                    createdAt={a.publishedAt || a.createdAt}
                    transparency={
                      a.articleAlignmentConfidence != null
                        ? Math.round(a.articleAlignmentConfidence * 100)
                        : null
                    }
                    featured={a.featured}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
