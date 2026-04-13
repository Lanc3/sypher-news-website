"use client";

type Dashboard = {
  total_claims: number;
  verified: number;
  partially_verified: number;
  single_source: number;
  unverifiable: number;
  overall_evidence_strength: string;
  source_domain_count: number;
};

function strengthLabel(s: string): string {
  if (s === "strong") return "Strong evidence";
  if (s === "moderate") return "Moderate evidence";
  if (s === "weak") return "Weak evidence";
  return s;
}

function strengthColor(s: string): string {
  if (s === "strong") return "text-green-400";
  if (s === "moderate") return "text-yellow-400";
  return "text-red-400";
}

const SEG_COLORS: Record<string, string> = {
  verified: "bg-green-500",
  partial: "bg-yellow-500",
  single: "bg-orange-400",
  unverif: "bg-red-500/70",
};

const DOT_COLORS: Record<string, string> = {
  verified: "bg-green-500",
  partial: "bg-yellow-500",
  single: "bg-orange-400",
  unverifiable: "bg-red-500/70",
};

export function ConfidenceDashboard({ dashboard }: { dashboard: Dashboard | null }) {
  if (!dashboard || !dashboard.total_claims) return null;

  const d = dashboard;
  const total = d.total_claims || 1;

  const segments = [
    { key: "verified", count: d.verified, label: "Verified" },
    { key: "partial", count: d.partially_verified, label: "Partial" },
    { key: "single", count: d.single_source, label: "Single" },
    { key: "unverif", count: d.unverifiable, label: "Unverifiable" },
  ];

  return (
    <div className="panel border-[#00e8ff]/25 bg-black/50 p-4 sm:p-5">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[#bc13fe] sm:text-xs">
        Confidence dashboard
      </p>
      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-black/60">
        {segments.map(
          (seg) =>
            seg.count > 0 && (
              <div
                key={seg.key}
                className={`${SEG_COLORS[seg.key]} transition-all`}
                style={{ width: `${(seg.count / total) * 100}%` }}
                title={`${seg.label}: ${seg.count}`}
              />
            ),
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-[#a0a0a0] sm:text-xs">
        <span className={strengthColor(d.overall_evidence_strength)}>
          {strengthLabel(d.overall_evidence_strength)}
        </span>
        <span>{d.total_claims} claims</span>
        <span>{d.source_domain_count} source domains</span>
        <span className="flex items-center gap-2">
          {segments
            .filter((seg) => seg.count > 0)
            .map((seg) => (
              <span key={seg.key} className="inline-flex items-center gap-1">
                <span className={`inline-block h-2 w-2 rounded-full ${DOT_COLORS[seg.key]}`} />
                {seg.label}
              </span>
            ))}
        </span>
      </div>
    </div>
  );
}
