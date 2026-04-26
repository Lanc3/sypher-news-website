import { normalizeTag, type ConfidenceTier } from "./colors";

export type RawClaim = {
  claim: string;
  sources_supporting: string[];
  sources_contradicting: string[];
  confidence_tag: string;
  who_benefits: string;
  what_is_missing: string;
};

export type NormClaim = {
  id: string;
  index: number;
  claim: string;
  supporting: string[];
  contradicting: string[];
  tier: ConfidenceTier;
  whoBenefits: string;
  whatIsMissing: string;
  totalSources: number;
};

export function domainOf(url: string): string {
  try {
    const host = new URL(url).hostname;
    return host.replace(/^www\./, "");
  } catch {
    return url.slice(0, 30);
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function normalizeClaims(value: unknown): NormClaim[] {
  const raw = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? "claims" in value && Array.isArray((value as Record<string, unknown>).claims)
        ? (value as { claims: unknown[] }).claims
        : "items" in value && Array.isArray((value as Record<string, unknown>).items)
          ? (value as { items: unknown[] }).items
          : []
      : [];

  return raw
    .filter((it): it is Record<string, unknown> => Boolean(it) && typeof it === "object")
    .map((it, idx) => {
      const supporting = asStringArray(it.sources_supporting);
      const contradicting = asStringArray(it.sources_contradicting);
      return {
        id: `c${idx}`,
        index: idx,
        claim: typeof it.claim === "string" ? it.claim : "",
        supporting,
        contradicting,
        tier: normalizeTag(typeof it.confidence_tag === "string" ? it.confidence_tag : ""),
        whoBenefits: typeof it.who_benefits === "string" ? it.who_benefits : "",
        whatIsMissing: typeof it.what_is_missing === "string" ? it.what_is_missing : "",
        totalSources: supporting.length + contradicting.length,
      };
    })
    .filter((c) => c.claim.length > 0);
}

export type DomainNode = {
  domain: string;
  supportingCount: number;
  contradictingCount: number;
  totalCount: number;
  exampleUrl: string;
};

export function domainsFromClaims(claims: NormClaim[]): DomainNode[] {
  const map = new Map<string, DomainNode>();
  for (const c of claims) {
    for (const url of c.supporting) {
      const d = domainOf(url);
      const node = map.get(d) || { domain: d, supportingCount: 0, contradictingCount: 0, totalCount: 0, exampleUrl: url };
      node.supportingCount++;
      node.totalCount++;
      map.set(d, node);
    }
    for (const url of c.contradicting) {
      const d = domainOf(url);
      const node = map.get(d) || { domain: d, supportingCount: 0, contradictingCount: 0, totalCount: 0, exampleUrl: url };
      node.contradictingCount++;
      node.totalCount++;
      map.set(d, node);
    }
  }
  return [...map.values()].sort((a, b) => b.totalCount - a.totalCount);
}

export type Edge = {
  claimId: string;
  domain: string;
  kind: "support" | "contradict";
};

export function claimDomainEdges(claims: NormClaim[]): Edge[] {
  const edges: Edge[] = [];
  for (const c of claims) {
    const seenSup = new Set<string>();
    const seenCon = new Set<string>();
    for (const url of c.supporting) {
      const d = domainOf(url);
      if (!seenSup.has(d)) {
        edges.push({ claimId: c.id, domain: d, kind: "support" });
        seenSup.add(d);
      }
    }
    for (const url of c.contradicting) {
      const d = domainOf(url);
      if (!seenCon.has(d)) {
        edges.push({ claimId: c.id, domain: d, kind: "contradict" });
        seenCon.add(d);
      }
    }
  }
  return edges;
}

export function bipartiteY(index: number, count: number, top: number, bottom: number): number {
  if (count <= 1) return (top + bottom) / 2;
  return top + ((bottom - top) * index) / (count - 1);
}

export type RadialPosition = { x: number; y: number; angle: number; radius: number };

export function radialClusterLayout(
  groups: Array<{ key: string; size: number }>,
  cx: number,
  cy: number,
  radius: number,
): Map<string, { startAngle: number; endAngle: number }> {
  const total = groups.reduce((acc, g) => acc + g.size, 0) || 1;
  let cursor = -Math.PI / 2;
  const out = new Map<string, { startAngle: number; endAngle: number }>();
  const gap = Math.min(0.06, (Math.PI * 2) / (groups.length * 8));
  for (const g of groups) {
    const span = (Math.PI * 2 - gap * groups.length) * (g.size / total);
    out.set(g.key, { startAngle: cursor, endAngle: cursor + span });
    cursor += span + gap;
  }
  void cx; void cy; void radius;
  return out;
}

export function pointOnCircle(cx: number, cy: number, r: number, angle: number): { x: number; y: number } {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}
