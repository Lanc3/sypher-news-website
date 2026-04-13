"use client";

type Claim = {
  claim: string;
  sources_supporting: string[];
  sources_contradicting: string[];
  confidence_tag: string;
  who_benefits: string;
  what_is_missing: string;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeClaims(value: unknown): Claim[] {
  const rawClaims = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? (
          "claims" in value && Array.isArray(value.claims)
            ? value.claims
            : "items" in value && Array.isArray(value.items)
              ? value.items
              : []
        )
      : [];

  return rawClaims
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      claim: typeof item.claim === "string" ? item.claim : "",
      sources_supporting: asStringArray(item.sources_supporting),
      sources_contradicting: asStringArray(item.sources_contradicting),
      confidence_tag: typeof item.confidence_tag === "string" ? item.confidence_tag : "UNVERIFIED",
      who_benefits: typeof item.who_benefits === "string" ? item.who_benefits : "",
      what_is_missing: typeof item.what_is_missing === "string" ? item.what_is_missing : "",
    }))
    .filter((item) => item.claim.length > 0);
}

function tagStyle(tag: string): string {
  const t = tag.toUpperCase();
  if (t === "VERIFIED") return "border-green-500/50 text-green-400";
  if (t === "PARTIALLY VERIFIED") return "border-yellow-500/50 text-yellow-400";
  if (t === "SINGLE SOURCE") return "border-orange-400/50 text-orange-400";
  return "border-red-500/50 text-red-400";
}

function domainOf(url: string): string {
  try {
    const host = new URL(url).hostname;
    return host.replace(/^www\./, "");
  } catch {
    return url.slice(0, 30);
  }
}

export function ClaimMap({ claims }: { claims: Claim[] | null | unknown }) {
  const normalizedClaims = normalizeClaims(claims);
  if (normalizedClaims.length === 0) return null;

  return (
    <section>
      <h2 className="mb-2 font-mono text-xs font-medium uppercase tracking-widest text-[#e0e0e0]/70 sm:text-sm">
        Claim Map
      </h2>
      <p className="mb-4 font-mono text-[11px] text-[#888] sm:text-xs">
        Each factual claim extracted from this article, with its supporting evidence and gaps.
      </p>
      <div className="space-y-3">
        {normalizedClaims.map((c, idx) => (
          <div key={idx} className="panel border-[#00e8ff]/15 p-3 sm:p-4">
            <span
              className={`inline-block rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tagStyle(c.confidence_tag)}`}
            >
              {c.confidence_tag}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-[#e0e0e0]">{c.claim}</p>

            {c.sources_supporting.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] sm:text-xs">
                <span className="font-mono text-[#666]">Supported by:</span>
                {c.sources_supporting.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm bg-green-900/30 px-1.5 py-0.5 text-green-400 hover:bg-green-900/50"
                  >
                    {domainOf(url)}
                  </a>
                ))}
              </div>
            )}

            {c.sources_contradicting.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] sm:text-xs">
                <span className="font-mono text-[#666]">Contradicted by:</span>
                {c.sources_contradicting.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm bg-red-900/30 px-1.5 py-0.5 text-red-400 hover:bg-red-900/50"
                  >
                    {domainOf(url)}
                  </a>
                ))}
              </div>
            )}

            {c.who_benefits && (
              <p className="mt-2 text-xs text-[#9a9a9a]">
                <span className="font-mono text-[#666]">Who benefits: </span>
                {c.who_benefits}
              </p>
            )}
            {c.what_is_missing && (
              <p className="mt-1 text-xs text-[#9a9a9a]">
                <span className="font-mono text-[#666]">What&apos;s missing: </span>
                {c.what_is_missing}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
