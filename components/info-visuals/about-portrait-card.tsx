import { Ban } from "lucide-react";

export function AboutPortraitCard() {
  return (
    <div className="panel relative mx-auto w-full max-w-[320px] overflow-hidden p-4 sm:p-5">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[rgba(var(--neon-rgb),0.12)] blur-2xl"
        aria-hidden
      />
      <div className="flex gap-4">
        <div className="relative h-[88px] w-[72px] shrink-0 overflow-hidden rounded border-2 border-[var(--neon)] bg-[var(--surface-elevated)] shadow-[0_0_20px_rgba(var(--neon-rgb),0.2)]">
          <svg viewBox="0 0 72 88" className="h-full w-full text-[var(--neon)]/30" aria-hidden>
            <rect x="8" y="12" width="56" height="56" rx="4" fill="currentColor" opacity="0.15" />
            <circle cx="36" cy="36" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 72 Q36 58 52 72" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="sr-only">Portrait placeholder</span>
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Aaron Keating</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#888]">Editor · Sypher News</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[var(--neon)]">
              18 yrs
            </span>
            <span className="rounded border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[var(--neon-pink)]">
              Ireland
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const antiPatterns = [
  { label: "Clickbait", sub: "Sensational empty hooks" },
  { label: "Empty outrage", sub: "Noise without signal" },
  { label: "Rewritten wire", sub: "Copy with no extra value" },
  { label: "Thin mainstream spin", sub: "Typical coverage only" },
];

export function AboutAntiPatternGrid() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
      {antiPatterns.map((item) => (
        <div
          key={item.label}
          className="panel panel-glow relative overflow-hidden p-3 sm:p-4"
        >
          <Ban className="absolute right-2 top-2 h-4 w-4 text-[var(--neon-pink)]/35" aria-hidden />
          <p className="pr-6 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#c8c8c8] line-through decoration-[var(--neon-pink)]/50">
            {item.label}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-[#6f7580]">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}
