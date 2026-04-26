const steps = [
  { n: "1", label: "Report", detail: "URL + issue + evidence" },
  { n: "2", label: "Review", detail: "Desk verifies claim" },
  { n: "3", label: "Republish", detail: "Visible update" },
] as const;

export function CorrectionFlowHero() {
  return (
    <div className="panel mx-auto w-full max-w-[380px] p-4 sm:p-5">
      <div className="relative px-1">
        <svg
          className="pointer-events-none absolute left-[12%] right-[12%] top-[18px] h-3 w-[76%]"
          preserveAspectRatio="none"
          aria-hidden
        >
          <line
            x1="0"
            y1="2"
            x2="100%"
            y2="2"
            stroke="var(--neon)"
            strokeWidth="2"
            strokeOpacity="0.55"
            vectorEffect="non-scaling-stroke"
            className="rich-flow-line"
          />
        </svg>
        <ol className="relative flex items-start justify-between gap-1">
          {steps.map((s) => (
            <li key={s.n} className="flex w-[31%] flex-col items-center text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--neon)] bg-[var(--surface-elevated)] font-mono text-xs font-bold text-[var(--neon)]">
                {s.n}
              </span>
              <span className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#d0d4dc]">{s.label}</span>
              <span className="mt-1 hidden text-[9px] leading-tight text-[#6f7580] sm:block">{s.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function CorrectionNoticeSample() {
  return (
    <div className="panel panel-glow border-[rgba(var(--neon-pink-rgb),0.25)] p-4 sm:p-5">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--neon-pink)]">Sample notice</p>
      <p className="mt-2 font-mono text-xs text-[#b8c0cc]">
        <span className="text-[var(--neon)]">Correction (2026-04-01):</span> An earlier version misstated a company name;
        the article and headline have been updated. We regret the error.
      </p>
    </div>
  );
}
