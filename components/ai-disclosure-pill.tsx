import Link from "next/link";

/**
 * Compact disclosure pill: AI-assisted research + human editorial review.
 * Used on article hero and (compact variant) on article cards.
 */
export function AiDisclosurePill({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-[#bc13fe]/30 bg-[#bc13fe]/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-[#bc13fe]/80 sm:text-[10px]">
        <span aria-hidden>◆</span>
        AI · Reviewed
      </span>
    );
  }
  return (
    <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-[#bc13fe]/30 bg-[#bc13fe]/5 px-3 py-1.5 font-mono text-[11px] text-[#d7d7d7] sm:text-xs">
      <span className="text-[#bc13fe]" aria-hidden>
        ◆
      </span>
      <span>
        <strong className="text-[#e8e8e8]">AI-assisted research</strong>
        <span className="text-[#777]"> · </span>
        <strong className="text-[#e8e8e8]">Reviewed by a human editor</strong>
      </span>
      <Link
        href="/methodology"
        className="text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-4 hover:decoration-[#bc13fe]"
      >
        How we work →
      </Link>
    </div>
  );
}
