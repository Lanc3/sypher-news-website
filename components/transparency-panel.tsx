import { MarkdownBody } from "@/components/markdown-body";

export function TransparencyPanel({
  transparency,
  label,
  sourceBalanceSummary,
  rationale,
}: {
  transparency: number | null;
  label?: string | null;
  sourceBalanceSummary?: string | null;
  rationale?: string | null;
}) {
  if (transparency == null && !label && !sourceBalanceSummary && !rationale) return null;

  return (
    <section className="panel border-[#00e8ff]/25 bg-black/50 p-4 sm:p-5">
      <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-[#00e8ff] sm:text-sm">Transparency panel</h2>
      <div className="mt-4 space-y-4 text-sm text-[#b7dbe2]">
        {transparency != null ? (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bc13fe]">Bias signal</p>
            <p className="mt-1 text-[#e9f6f8]">Transparency index: {transparency}/100</p>
          </div>
        ) : null}
        {label ? (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bc13fe]">Framing read</p>
            <p className="mt-1 text-[#e9f6f8]">{label}</p>
          </div>
        ) : null}
        {sourceBalanceSummary ? (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bc13fe]">Source mix</p>
            <MarkdownBody content={sourceBalanceSummary} />
          </div>
        ) : null}
        {rationale ? (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bc13fe]">Why we flagged it</p>
            <MarkdownBody content={rationale} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
