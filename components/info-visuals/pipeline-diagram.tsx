const stages = [
  { label: "Searcher", cx: 48 },
  { label: "Analyst", cx: 144 },
  { label: "Writer", cx: 240 },
  { label: "Critic", cx: 336 },
] as const;

const cy = 32;

export function PipelineDiagram() {
  return (
    <div className="panel mx-auto w-full max-w-[400px] overflow-x-auto p-4 sm:p-5">
      <svg viewBox="0 0 384 88" className="mx-auto h-auto w-full min-w-[300px]" role="img" aria-label="Four-stage pipeline: Searcher, Analyst, Writer, Critic">
        <title>Pipeline stages</title>
        <defs>
          <filter id="pipeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[0, 1, 2].map((i) => {
          const a = stages[i];
          const b = stages[i + 1];
          return (
            <line
              key={`${a.cx}-${b.cx}`}
              x1={a.cx + 26}
              y1={cy}
              x2={b.cx - 26}
              y2={cy}
              stroke="#00e8ff"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              className="rich-flow-line"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          );
        })}
        {stages.map((s) => (
          <g key={s.label} filter="url(#pipeGlow)">
            <circle cx={s.cx} cy={cy} r="20" fill="var(--surface-elevated)" stroke="#00e8ff" strokeWidth="1.5" />
            <text
              x={s.cx}
              y={cy + 48}
              textAnchor="middle"
              fill="#9aa3b0"
              fontFamily="ui-monospace, monospace"
              fontSize="9"
              letterSpacing="0.08em"
            >
              {s.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
