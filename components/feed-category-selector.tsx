"use client";

import { useMemo, useState, useTransition } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCategoryPreferences } from "@/app/actions/feed";
import { COUNTRIES, NAME_TO_COUNTRY, SLUG_TO_COUNTRY } from "@/lib/countries";
import { mainTopicIconFor } from "@/lib/feed-category-main-icon";
import { isoNumericToAlpha2 } from "@/lib/iso3166-numeric-to-alpha2";
import { cn } from "@/lib/utils";

type Category = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

function countryFlagAlpha2(cat: Category): string | undefined {
  const slug = cat.slug.toLowerCase();
  const bySlug = SLUG_TO_COUNTRY.get(slug);
  const entry = bySlug ?? NAME_TO_COUNTRY.get(cat.name.toLowerCase());
  if (!entry) return undefined;
  return isoNumericToAlpha2(entry.code);
}

function IconPreferenceButton({
  isSelected,
  onToggle,
  label,
  description,
  children,
}: {
  isSelected: boolean;
  onToggle: () => void;
  label: string;
  description: string | null;
  children: React.ReactNode;
}) {
  const aria = description ? `${label}. ${description}` : label;

  return (
    <button
      type="button"
      aria-label={aria}
      aria-pressed={isSelected}
      onClick={onToggle}
      className={cn(
        "group relative flex min-h-8 min-w-8 items-center justify-center rounded-lg border p-1 transition-all",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00e8ff]/60",
        isSelected
          ? "border-[#00e8ff]/60 bg-[#00e8ff]/10 ring-1 ring-[#00e8ff]/25"
          : "border-[#333] bg-black/30 hover:border-[#555]",
      )}
    >
      {children}
      <span
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-[60] mt-2 w-max max-w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2",
          "rounded-md border border-[#333] bg-[#0a0d14] px-3 py-2 text-left font-mono text-xs leading-snug text-[#eaeaea] shadow-xl",
          "invisible opacity-0 transition-opacity duration-150",
          "group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100",
        )}
        role="tooltip"
      >
        <span className="block text-sm font-medium text-[#00e8ff]">{label}</span>
        {description ? (
          <span className="mt-1 block text-[11px] font-normal leading-relaxed text-[#9a9a9a]">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function FeedCategorySelector({
  categories,
  initialSelected,
  onSaved,
}: {
  categories: Category[];
  initialSelected: number[];
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set(initialSelected));
  const [isPending, startTransition] = useTransition();
  const countryLookup = useMemo(() => {
    const slugs = new Set<string>();
    const names = new Set<string>();

    for (const country of COUNTRIES) {
      names.add(country.name.toLowerCase());
      for (const slug of country.slugs) slugs.add(slug.toLowerCase());
    }

    return { slugs, names };
  }, []);

  const { mainCategories, countryCategories } = useMemo(() => {
    const main: Category[] = [];
    const countries: Category[] = [];

    for (const cat of categories) {
      const slug = cat.slug.toLowerCase();
      const name = cat.name.toLowerCase();
      const isCountry = countryLookup.slugs.has(slug) || countryLookup.names.has(name);
      if (isCountry) countries.push(cat);
      else main.push(cat);
    }

    return { mainCategories: main, countryCategories: countries };
  }, [categories, countryLookup]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      await updateCategoryPreferences(Array.from(selected));
      onSaved();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-mono text-lg font-semibold text-[#00e8ff] sm:text-xl">
          Choose your categories
        </h2>
        <p className="mt-1 text-sm text-[#888]">
          Tap an icon to toggle it. Hover or keyboard-focus an icon to read the full name and
          description.
        </p>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-sm font-semibold text-[#c8c8c8]">Main Categories</h3>
          <span className="font-mono text-xs text-[#666]">{mainCategories.length}</span>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
          {mainCategories.map((cat) => {
            const isSelected = selected.has(cat.id);
            const Icon = mainTopicIconFor(cat.slug, cat.name);
            return (
              <IconPreferenceButton
                key={cat.id}
                isSelected={isSelected}
                onToggle={() => toggle(cat.id)}
                label={cat.name}
                description={cat.description}
              >
                <Icon
                  className={cn(
                    "size-[1.12rem] shrink-0 stroke-1",
                    isSelected
                      ? "text-[#00e8ff]"
                      : "text-[#888] group-hover:text-[#c8c8c8] group-focus-visible:text-[#c8c8c8]",
                  )}
                  aria-hidden
                />
              </IconPreferenceButton>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-sm font-semibold text-[#c8c8c8]">Countries</h3>
          <span className="font-mono text-xs text-[#666]">{countryCategories.length}</span>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
          {countryCategories.map((cat) => {
            const isSelected = selected.has(cat.id);
            const alpha2 = countryFlagAlpha2(cat);
            const flagSrc = alpha2
              ? `https://flagcdn.com/w80/${alpha2}.png`
              : null;

            return (
              <IconPreferenceButton
                key={cat.id}
                isSelected={isSelected}
                onToggle={() => toggle(cat.id)}
                label={cat.name}
                description={cat.description}
              >
                {flagSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element -- small remote flags; avoids image remotePatterns config
                  <img
                    src={flagSrc}
                    alt=""
                    width={22}
                    height={16}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "h-4 w-[1.4rem] shrink-0 rounded-md object-cover ring-1 ring-white/10",
                      isSelected ? "ring-[#00e8ff]/40" : "opacity-90 group-hover:opacity-100",
                    )}
                  />
                ) : (
                  <Globe
                    className={cn(
                      "size-[1.12rem] shrink-0",
                      isSelected
                        ? "text-[#00e8ff]"
                        : "text-[#888] group-hover:text-[#c8c8c8] group-focus-visible:text-[#c8c8c8]",
                    )}
                    aria-hidden
                  />
                )}
              </IconPreferenceButton>
            );
          })}
        </div>
      </section>

      {categories.length === 0 && (
        <p className="rounded-md border border-dashed border-[#00e8ff]/25 bg-black/30 py-8 text-center text-sm text-[#666]">
          No categories available yet.
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#888]">
          {selected.size} {selected.size === 1 ? "category" : "categories"} selected
        </p>
        <Button onClick={handleSave} disabled={isPending || selected.size === 0}>
          {isPending ? "Saving..." : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}
