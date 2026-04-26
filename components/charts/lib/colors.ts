export const NEON = "#00e8ff";
export const NEON_PINK = "#bc13fe";
export const SURFACE = "#0a0d14";

export type ConfidenceTier = "VERIFIED" | "PARTIALLY VERIFIED" | "SINGLE SOURCE" | "UNVERIFIABLE";

export function normalizeTag(tag: string | null | undefined): ConfidenceTier {
  const t = (tag || "").toUpperCase().trim();
  if (t === "VERIFIED") return "VERIFIED";
  if (t === "PARTIALLY VERIFIED" || t === "PARTIAL" || t === "PARTIALY VERIFIED") return "PARTIALLY VERIFIED";
  if (t === "SINGLE SOURCE" || t === "SINGLE_SOURCE") return "SINGLE SOURCE";
  return "UNVERIFIABLE";
}

export function tierToY(tier: ConfidenceTier): number {
  switch (tier) {
    case "VERIFIED": return 3;
    case "PARTIALLY VERIFIED": return 2;
    case "SINGLE SOURCE": return 1;
    case "UNVERIFIABLE": return 0;
  }
}

export function tierColor(tier: ConfidenceTier): string {
  switch (tier) {
    case "VERIFIED": return "#22d3a8";
    case "PARTIALLY VERIFIED": return "#e8d566";
    case "SINGLE SOURCE": return "#ff9a3c";
    case "UNVERIFIABLE": return "#ff4d6d";
  }
}

export function tierLabel(tier: ConfidenceTier): string {
  switch (tier) {
    case "VERIFIED": return "Verified";
    case "PARTIALLY VERIFIED": return "Partial";
    case "SINGLE SOURCE": return "Single source";
    case "UNVERIFIABLE": return "Unverified";
  }
}

const ROLE_COLORS: Record<string, string> = {
  government_regulatory: "#7ad7ff",
  industry_corporate: "#ff7ad7",
  advocacy_nonprofit: "#a07cff",
  academic_research: "#7cffb2",
  investor_market: "#ffd97c",
  consumer: "#7c9aff",
  media_editorial: "#ff7c7c",
  unknown: "#7a7f8a",
};

export function roleColor(role: string | null | undefined): string {
  return ROLE_COLORS[(role || "unknown").toLowerCase()] || ROLE_COLORS.unknown;
}

const ROLE_LABELS: Record<string, string> = {
  government_regulatory: "Government / Regulatory",
  industry_corporate: "Industry / Corporate",
  advocacy_nonprofit: "Advocacy / Nonprofit",
  academic_research: "Academic / Research",
  investor_market: "Investor / Market",
  consumer: "Consumer",
  media_editorial: "Media / Editorial",
  unknown: "Unknown",
};

export function roleLabel(role: string | null | undefined): string {
  const k = (role || "unknown").toLowerCase();
  return ROLE_LABELS[k] || k.replace(/_/g, " ");
}

export function alignmentAngle(label: string | null | undefined): number {
  const l = (label || "").toLowerCase();
  if (l.includes("left")) return -Math.PI / 2;
  if (l.includes("right")) return Math.PI / 2;
  if (l.includes("center")) return 0;
  return 0;
}

export function alignmentToOffset(label: string | null | undefined): number {
  const l = (label || "").toLowerCase();
  if (l === "far_left") return -2;
  if (l === "left" || l.includes("center_left") || l === "lean_left") return -1;
  if (l === "center" || l === "neutral") return 0;
  if (l === "right" || l.includes("center_right") || l === "lean_right") return 1;
  if (l === "far_right") return 2;
  return 0;
}
