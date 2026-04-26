const rows = [
  { tag: "VERIFIED", desc: "Three or more independent sources", dots: 4 },
  { tag: "PARTIALLY VERIFIED", desc: "Exactly two independent sources", dots: 2 },
  { tag: "SINGLE SOURCE", desc: "One outlet — explicitly flagged", dots: 1 },
  { tag: "UNVERIFIABLE", desc: "Disagreement or not checkable", dots: 0 },
] as const;

export function VerificationTagLegend() {
  return (
    <div className="panel mx-auto mt-6 grid max-w-xl gap-3 p-4 sm:p-5">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--neon-pink)]">Tag legend</p>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.tag}
            className="flex flex-col gap-2 border-b border-[var(--border-subtle)] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-mono text-xs font-semibold tracking-wide text-[#e8e8e8]">{row.tag}</p>
              <p className="mt-0.5 text-xs text-[#8a909c]">{row.desc}</p>
            </div>
            <div className="flex gap-1.5" aria-hidden title="Corroboration strength">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full border border-[var(--neon)]/40"
                  style={{
                    backgroundColor: i < row.dots ? "var(--neon)" : "transparent",
                    opacity: i < row.dots ? 0.9 : 0.25,
                  }}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
