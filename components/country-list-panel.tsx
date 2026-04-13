"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

type CountryItem = {
  code: string;
  name: string;
  slug: string | null;
  hasArticles: boolean;
};

export function CountryListPanel({
  countries,
  selectedCode,
  onSelect,
}: {
  countries: CountryItem[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, search]);

  const withArticles = filtered.filter((c) => c.hasArticles);
  const withoutArticles = filtered.filter((c) => !c.hasArticles);

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 border-b border-[#00e8ff]/15 bg-[#0a0d14] px-3 py-3">
        <div className="flex items-center gap-2 rounded-md border border-[#00e8ff]/20 bg-black/40 px-3 py-2">
          <Search className="size-3.5 shrink-0 text-[#00e8ff]/50" aria-hidden />
          <input
            type="search"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent font-mono text-xs text-[#e0e0e0] outline-none placeholder:text-[#555]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-1 py-1">
        {withArticles.length > 0 && (
          <div className="px-2 pt-2 pb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00e8ff]/50">
              With articles
            </span>
          </div>
        )}
        {withArticles.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => onSelect(c.code)}
            className={`w-full rounded-md px-3 py-2 text-left font-mono text-xs transition-colors ${
              selectedCode === c.code
                ? "bg-[#bc13fe]/15 text-[#bc13fe] border border-[#bc13fe]/30"
                : "text-[#e0e0e0] hover:bg-[#00e8ff]/8 hover:text-[#00e8ff] border border-transparent"
            }`}
          >
            {c.name}
          </button>
        ))}

        {withoutArticles.length > 0 && (
          <div className="px-2 pt-3 pb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#555]">
              No articles yet
            </span>
          </div>
        )}
        {withoutArticles.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => onSelect(c.code)}
            className={`w-full rounded-md px-3 py-2 text-left font-mono text-xs transition-colors ${
              selectedCode === c.code
                ? "bg-[#bc13fe]/10 text-[#bc13fe]/70 border border-[#bc13fe]/20"
                : "text-[#555] hover:bg-[#00e8ff]/5 hover:text-[#888] border border-transparent"
            }`}
          >
            {c.name}
          </button>
        ))}

        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-[#666]">No matching countries</p>
        )}
      </div>
    </div>
  );
}
