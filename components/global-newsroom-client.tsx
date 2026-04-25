"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { CountryListPanel } from "@/components/country-list-panel";
import { COUNTRIES, CODE_TO_COUNTRY, SLUG_TO_COUNTRY } from "@/lib/countries";
import { Globe as GlobeIcon, Loader2, ArrowLeft, MapPin } from "lucide-react";

const GlobeView = dynamic(
  () => import("@/components/globe-view").then((m) => ({ default: m.GlobeView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-square max-w-[520px] mx-auto items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#00e8ff]/40" />
      </div>
    ),
  },
);

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
  coverImageUrl: string | null;
  coverImageThumbnailUrl: string | null;
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
  const [panelVisible, setPanelVisible] = useState(false);

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
        setPanelVisible(true);
        return;
      }

      startFetch(async () => {
        try {
          const res = await fetch(`/api/global-newsroom/articles?category=${cat.slug}`);
          if (!res.ok) {
            setArticles([]);
          } else {
            const data = await res.json();
            setArticles(data.articles || []);
          }
        } catch {
          setArticles([]);
        }
        setPanelVisible(true);
      });
    },
    [countryCategoryMap],
  );

  const handleClearSelection = useCallback(() => {
    setPanelVisible(false);
    setTimeout(() => {
      setSelectedCode(null);
      setSelectedCountryName(null);
      setArticles([]);
    }, 250);
  }, []);

  useEffect(() => {
    if (!selectedCode) setPanelVisible(false);
  }, [selectedCode]);

  const leadArticle = articles[0] ?? null;
  const supportingArticles = articles.slice(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="panel px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center gap-2">
          <GlobeIcon className="size-5 text-[#00e8ff]" aria-hidden />
          <h1 className="text-neon-glow font-mono text-xl font-bold text-[#00e8ff] sm:text-2xl">
            /global-newsroom
          </h1>
        </div>
        <p className="mt-2 text-sm text-[#666]">
          Select a country from the globe or list to explore news coverage from around the world.
        </p>
        {hoveredName && !selectedCode && (
          <p className="mt-2 font-mono text-xs text-[#00e8ff]/60">{hoveredName}</p>
        )}
      </header>

      {/* Globe + right panel */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        {/* Globe */}
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

        {/* Right panel: country list OR articles (animated swap) */}
        <div className="relative h-[360px] w-full overflow-hidden lg:h-[520px] lg:w-[300px] lg:shrink-0">
          {/* Country list */}
          <div
            className={`panel absolute inset-0 overflow-hidden transition-transform duration-300 ease-in-out ${
              panelVisible ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <CountryListPanel
              countries={countryListItems}
              selectedCode={selectedCode}
              onSelect={handleCountrySelect}
            />
          </div>

          {/* Articles panel */}
          <div
            className={`panel absolute inset-0 overflow-hidden transition-transform duration-300 ease-in-out ${
              panelVisible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex h-full flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-[#00e8ff]/10 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="size-3.5 shrink-0 text-[#00e8ff]/60" aria-hidden />
                  <span className="truncate font-mono text-sm font-semibold text-[#00e8ff]">
                    {selectedCountryName ?? "—"}
                  </span>
                  {isFetching && (
                    <Loader2 className="size-3.5 animate-spin text-[#00e8ff]/40" aria-hidden />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[#555] transition hover:text-[#c8c8c8]"
                  aria-label="Back to country list"
                >
                  <ArrowLeft className="size-3.5" aria-hidden />
                  <span className="hidden sm:inline">Back</span>
                </button>
              </div>

              {/* Articles list in panel */}
              <div className="flex-1 overflow-y-auto">
                {!isFetching && articles.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
                    <MapPin className="mb-3 size-8 text-[#222]" aria-hidden />
                    <p className="text-sm text-[#555]">No articles for {selectedCountryName}.</p>
                    <p className="mt-1 text-xs text-[#3a3a3a]">Coverage will appear when published.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-[#00e8ff]/5 p-3 space-y-2">
                    {articles.map((a, i) => (
                      <li key={a.id} className={i > 0 ? "pt-2" : ""}>
                        <Link
                          href={`/news/${a.categorySlug}/${a.slug}`}
                          className="group block rounded-md border border-transparent p-2 transition hover:border-[#00e8ff]/15 hover:bg-white/2"
                        >
                          <p className="font-mono text-xs font-semibold leading-snug text-[#00e8ff] group-hover:text-[#66f2ff]">
                            {a.title}
                          </p>
                          {a.summary ? (
                            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#666]">
                              {a.summary}
                            </p>
                          ) : null}
                          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#444]">
                            <span>{new Date(a.publishedAt || a.createdAt).toISOString().slice(0, 10)}</span>
                            {a.articleAlignmentConfidence != null && (
                              <>
                                <span aria-hidden>·</span>
                                <span className="rounded border border-[#00e8ff]/20 px-1 text-[#00e8ff]/70">
                                  T:{Math.round(a.articleAlignmentConfidence * 100)}
                                </span>
                              </>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Below the two-pane: full lead article layout when country is selected */}
      {selectedCode && !isFetching && articles.length > 0 && (
        <section id="country-articles" className="scroll-mt-12 space-y-5 sm:scroll-mt-14">
          <div className="flex items-center gap-3">
            <MapPin className="size-4 text-[#00e8ff]/60" aria-hidden />
            <h2 className="font-mono text-lg font-semibold text-[#00e8ff] sm:text-xl">
              {selectedCountryName}
            </h2>
            <span className="text-xs text-[#444]">
              {articles.length} {articles.length === 1 ? "story" : "stories"}
            </span>
          </div>

          {leadArticle ? (
            articles.length === 1 ? (
              <ArticleCard
                articleId={leadArticle.id}
                href={`/news/${leadArticle.categorySlug}/${leadArticle.slug}`}
                title={leadArticle.title}
                summary={leadArticle.summary}
                categoryName={leadArticle.categoryName}
                createdAt={leadArticle.publishedAt || leadArticle.createdAt}
                transparency={
                  leadArticle.articleAlignmentConfidence != null
                    ? Math.round(leadArticle.articleAlignmentConfidence * 100)
                    : null
                }
                featured={leadArticle.featured}
                coverImageUrl={leadArticle.coverImageUrl}
                coverImageThumbnailUrl={leadArticle.coverImageThumbnailUrl}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {/* Lead — 2 cols wide */}
                <div className="md:col-span-2">
                  <ArticleCard
                    articleId={leadArticle.id}
                    href={`/news/${leadArticle.categorySlug}/${leadArticle.slug}`}
                    title={leadArticle.title}
                    summary={leadArticle.summary}
                    categoryName={leadArticle.categoryName}
                    createdAt={leadArticle.publishedAt || leadArticle.createdAt}
                    transparency={
                      leadArticle.articleAlignmentConfidence != null
                        ? Math.round(leadArticle.articleAlignmentConfidence * 100)
                        : null
                    }
                    featured={leadArticle.featured}
                    coverImageUrl={leadArticle.coverImageUrl}
                    coverImageThumbnailUrl={leadArticle.coverImageThumbnailUrl}
                  />
                </div>
                {/* Supporting articles stacked */}
                <div className="flex flex-col gap-4">
                  {supportingArticles.slice(0, 2).map((a) => (
                    <ArticleCard
                      key={a.id}
                      articleId={a.id}
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
                      coverImageUrl={a.coverImageUrl}
                      coverImageThumbnailUrl={a.coverImageThumbnailUrl}
                      compact
                    />
                  ))}
                </div>
              </div>
            )
          ) : null}

          {/* Remaining articles */}
          {supportingArticles.length > 2 && (
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {supportingArticles.slice(2).map((a) => (
                <li key={a.id}>
                  <ArticleCard
                    articleId={a.id}
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
                    coverImageUrl={a.coverImageUrl}
                    coverImageThumbnailUrl={a.coverImageThumbnailUrl}
                    compact
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
