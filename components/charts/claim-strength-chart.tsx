import { NEON, NEON_PINK, tierColor, tierLabel, type ConfidenceTier } from "./lib/colors";
import { normalizeClaims, type NormClaim } from "./lib/layout";

type Dashboard = {
  total_claims: number;
  verified: number;
  partially_verified: number;
  single_source: number;
  unverifiable: number;
  overall_evidence_strength: string;
  source_domain_count: number;
};

const STRENGTH_LABEL: Record<string, string> = {
  strong: "Strong evidence",
  moderate: "Moderate evidence",
  weak: "Weak evidence",
};

const TIER_ORDER: ConfidenceTier[] = ["VERIFIED", "PARTIALLY VERIFIED", "SINGLE SOURCE", "UNVERIFIABLE"];

function strengthOf(d: Dashboard): "strong" | "moderate" | "weak" {
  const k = (d.overall_evidence_strength || "").toLowerCase();
  if (k === "strong" || k === "moderate" || k === "weak") return k;
  const total = d.total_claims || 1;
  const verifiedShare = d.verified / total;
  if (verifiedShare > 0.6) return "strong";
  if (verifiedShare > 0.3) return "moderate";
  return "weak";
}

export function ClaimStrengthChart({
  dashboard,
  claimMap,
}: {
  dashboard: Dashboard | null;
  claimMap: unknown;
}) {
  const claims = normalizeClaims(claimMap);

  if (!dashboard || !dashboard.total_claims) {
    if (claims.length === 0) return null;
    return <ClaimStripsOnly claims={claims} />;
  }

  const d = dashboard;
  const total = d.total_claims || 1;
  const segments = TIER_ORDER.map((tier) => {
    const count =
      tier === "VERIFIED" ? d.verified
        : tier === "PARTIALLY VERIFIED" ? d.partially_verified
          : tier === "SINGLE SOURCE" ? d.single_source
            : d.unverifiable;
    return { tier, count };
  });

  const strength = strengthOf(d);

  return (
    <section aria-labelledby="claim-strength-heading" className="panel border-[#00e8ff]/25 bg-black/50 p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="claim-strength-heading"
          className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[#bc13fe] sm:text-xs"
        >
          Claim Strength
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888] sm:text-[11px]">
          {d.total_claims} claims · {d.source_domain_count} domains
        </span>
      </div>

      <StackedBar segments={segments} total={total} />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[#a0a0a0] sm:text-[11px]">
        <span style={{ color: strength === "strong" ? "#22d3a8" : strength === "moderate" ? "#e8d566" : "#ff4d6d" }}>
          {STRENGTH_LABEL[strength] || strength}
        </span>
        {segments.filter((s) => s.count > 0).map((s) => (
          <span key={s.tier} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: tierColor(s.tier) }} />
            {tierLabel(s.tier)} <span className="text-[#666]">{s.count}</span>
          </span>
        ))}
      </div>

      {claims.length > 0 ? <ClaimStrips claims={claims} /> : null}
    </section>
  );
}

function StackedBar({ segments, total }: { segments: Array<{ tier: ConfidenceTier; count: number }>; total: number }) {
  const W = 1000;
  const H = 24;
  const layout: Array<{ tier: ConfidenceTier; count: number; x: number; w: number }> = [];
  {
    let cursor = 0;
    for (const s of segments) {
      if (s.count === 0) continue;
      const w = (s.count / total) * W;
      layout.push({ ...s, x: cursor, w });
      cursor += w;
    }
  }
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="mt-3 block h-6 w-full"
      role="img"
      aria-label={`Evidence mix: ${segments.map((s) => `${s.count} ${tierLabel(s.tier)}`).join(", ")}`}
    >
      <defs>
        <linearGradient id="csb-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} rx="4" fill="rgba(0,0,0,0.6)" />
      {layout.map((s) => (
        <g key={s.tier}>
          <rect x={s.x} y="0" width={s.w} height={H} fill={tierColor(s.tier)} opacity="0.85" />
          <rect x={s.x} y="0" width={s.w} height={H} fill="url(#csb-gloss)" />
          {s.w > 56 ? (
            <text
              x={s.x + s.w / 2}
              y={H / 2 + 3}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fontSize="11"
              fontWeight="600"
              fill="#0a0d14"
            >
              {s.count}
            </text>
          ) : null}
        </g>
      ))}
      <rect x="0" y="0" width={W} height={H} rx="4" fill="none" stroke="rgba(0,232,255,0.18)" />
    </svg>
  );
}

function ClaimStrips({ claims }: { claims: NormClaim[] }) {
  const sorted = [...claims].sort((a, b) => {
    const tierDelta = (["VERIFIED", "PARTIALLY VERIFIED", "SINGLE SOURCE", "UNVERIFIABLE"] as ConfidenceTier[]).indexOf(a.tier)
      - (["VERIFIED", "PARTIALLY VERIFIED", "SINGLE SOURCE", "UNVERIFIABLE"] as ConfidenceTier[]).indexOf(b.tier);
    if (tierDelta !== 0) return tierDelta;
    return b.totalSources - a.totalSources;
  });
  const max = sorted.reduce((m, c) => Math.max(m, c.supporting.length), 0) || 1;

  return (
    <div className="mt-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888] sm:text-[11px]">
        Per-claim breakdown — sorted by strength
      </p>
      <ul className="mt-2 space-y-1.5">
        {sorted.map((c) => {
          const pct = (c.supporting.length / max) * 100;
          const color = tierColor(c.tier);
          return (
            <li key={c.id} className="grid grid-cols-[14px_1fr_auto] items-center gap-2 text-[11px] sm:text-xs">
              <span
                className="block h-2.5 w-2.5 rounded-full"
                style={{ background: color, boxShadow: `0 0 6px ${color}66` }}
                aria-hidden
              />
              <span className="flex min-w-0 items-center gap-2">
                <span className="block h-1.5 rounded-sm" style={{ width: `${Math.max(2, pct)}%`, background: color, opacity: 0.85 }} />
                <span className="min-w-0 flex-1 truncate text-[#cfd8e0]" title={c.claim}>
                  {c.claim}
                </span>
              </span>
              <span className="font-mono text-[#666]">
                <span style={{ color: "#22d3a8" }}>{c.supporting.length}</span>
                {c.contradicting.length > 0 ? <> / <span style={{ color: NEON_PINK }}>{c.contradicting.length}</span></> : null}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 font-mono text-[10px] text-[#555]">
        <span style={{ color: NEON }}>support</span> / <span style={{ color: NEON_PINK }}>contradict</span> source counts
      </p>
    </div>
  );
}

function ClaimStripsOnly({ claims }: { claims: NormClaim[] }) {
  return (
    <section className="panel border-[#00e8ff]/25 bg-black/50 p-4 sm:p-5">
      <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[#bc13fe] sm:text-xs">
        Claim Strength
      </h2>
      <ClaimStrips claims={claims} />
    </section>
  );
}
