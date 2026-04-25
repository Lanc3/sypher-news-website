type Dashboard = {
  total_claims?: number;
  verified?: number;
  partially_verified?: number;
  single_source?: number;
  unverifiable?: number;
} | null;

type Spectrum = Array<{
  source?: string;
  editorial_frame?: string;
  alignment_label?: string;
}> | null;

type Props = {
  sourcesCount: number;
  confidenceDashboard: Dashboard;
  perspectiveSpectrum: Spectrum;
  missingVoicesCount?: number | null;
};

function verifiedRate(d: Dashboard): number | null {
  if (!d || !d.total_claims || d.total_claims <= 0) return null;
  const verified = (d.verified ?? 0) + (d.partially_verified ?? 0);
  return Math.round((verified / d.total_claims) * 100);
}

function uniqueFramings(spectrum: Spectrum): number {
  if (!spectrum || spectrum.length === 0) return 0;
  const set = new Set<string>();
  for (const row of spectrum) {
    const frame = (row.editorial_frame || row.alignment_label || "").trim().toLowerCase();
    if (frame) set.add(frame);
  }
  return set.size;
}

/**
 * Inline strip of "originality" signals shown on the article hero.
 * Each badge surfaces a number that proves real editorial work happened.
 * Renders nothing if all values are zero/null (defensive — articles always
 * have at least the source count populated by the pipeline).
 */
export function ArticleOriginalityBadges({
  sourcesCount,
  confidenceDashboard,
  perspectiveSpectrum,
  missingVoicesCount,
}: Props) {
  const claimRate = verifiedRate(confidenceDashboard);
  const framings = uniqueFramings(perspectiveSpectrum);
  const totalClaims = confidenceDashboard?.total_claims ?? null;

  const items: Array<{ label: string; value: string }> = [];
  if (sourcesCount > 0) items.push({ label: "sources analyzed", value: String(sourcesCount) });
  if (totalClaims) items.push({ label: "claims tracked", value: String(totalClaims) });
  if (claimRate != null) items.push({ label: "claim verification", value: `${claimRate}%` });
  if (framings > 0) items.push({ label: "framings compared", value: String(framings) });
  if (missingVoicesCount != null && missingVoicesCount > 0)
    items.push({ label: "missing voices identified", value: String(missingVoicesCount) });

  if (items.length === 0) return null;

  return (
    <dl className="mt-5 flex flex-wrap gap-2 sm:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="inline-flex items-baseline gap-1.5 rounded-md border border-[#00e8ff]/20 bg-black/40 px-2.5 py-1.5 sm:px-3"
        >
          <dt className="sr-only">{item.label}</dt>
          <dd className="font-mono text-sm font-semibold text-[#00e8ff] sm:text-base">{item.value}</dd>
          <span aria-hidden className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#888] sm:text-[11px]">
            {item.label}
          </span>
        </div>
      ))}
    </dl>
  );
}
