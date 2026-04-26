"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type RichTocItem = { id: string; label: string };

export function RichInfoTOC({ items }: { items: RichTocItem[] }) {
  const [activeId, setActiveId] = useState<string>(() => items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { root: null, rootMargin: "-42% 0px -42% 0px", threshold: [0, 0.08, 0.2, 0.35, 0.55, 0.75, 1] },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="font-mono">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.35em] text-[#888]">On this page</p>
      <ul className="space-y-0.5 border-l border-[var(--border-subtle)] text-[11px] uppercase tracking-[0.18em]">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block border-l-2 py-2 pl-3 -ml-px transition-colors duration-200",
                activeId === item.id
                  ? "border-[var(--neon)] text-[var(--neon)]"
                  : "border-transparent text-[#8a8f9a] hover:border-[var(--neon-pink)]/45 hover:text-[var(--neon-pink)]",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
