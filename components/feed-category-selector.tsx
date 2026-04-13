"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateCategoryPreferences } from "@/app/actions/feed";

type Category = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

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
          Select the topics you want in your feed. You can change these at any time.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((cat) => {
          const isSelected = selected.has(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              className={`rounded-lg border px-3 py-3 text-left font-mono text-sm transition-all ${
                isSelected
                  ? "border-[#00e8ff]/60 bg-[#00e8ff]/10 text-[#00e8ff]"
                  : "border-[#333] bg-black/30 text-[#888] hover:border-[#555] hover:text-[#c8c8c8]"
              }`}
            >
              <span className="block truncate font-medium">{cat.name}</span>
              {cat.description && (
                <span className="mt-1 block truncate text-xs opacity-60">
                  {cat.description}
                </span>
              )}
            </button>
          );
        })}
      </div>

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
