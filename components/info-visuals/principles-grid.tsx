const principles = ["Sourcing", "Framing", "Transparency", "Review", "Corrections"] as const;

export function PrinciplesRing() {
  const cx = 90;
  const cy = 90;
  const r = 58;
  const step = (2 * Math.PI) / principles.length;

  return (
    <div className="panel mx-auto w-full max-w-[220px] p-4 sm:max-w-[240px] sm:p-5">
      <svg viewBox="0 0 180 180" className="mx-auto h-auto w-full" role="img" aria-label="Editorial principles ring">
        <title>Principles</title>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,232,255,0.12)" strokeWidth="1" strokeDasharray="4 6" />
        {principles.map((label, i) => {
          const angle = -Math.PI / 2 + i * step;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          return (
            <g key={label}>
              <circle cx={x} cy={y} r="22" fill="var(--surface-elevated)" stroke="var(--neon)" strokeWidth="1.2" />
              <text
                x={x}
                y={y + 3}
                textAnchor="middle"
                fill="#c8d0dc"
                fontFamily="ui-monospace, monospace"
                fontSize={label.length > 11 ? 6.5 : 7.5}
                letterSpacing="0.04em"
              >
                {label}
              </text>
            </g>
          );
        })}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fill="var(--neon-pink)"
          fontFamily="ui-monospace, monospace"
          fontSize="9"
          letterSpacing="0.2em"
          fontWeight="600"
        >
          STANDARDS
        </text>
      </svg>
    </div>
  );
}
