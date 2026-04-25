/**
 * Pre-processing for AI-generated article markdown.
 *
 * Two responsibilities:
 *   1. Replace bare `[https://...]` and `[https://..., https://...]` inline citations
 *      with numbered superscript markers `[1]`, `[2]`, ... that link out to the source.
 *      Each unique URL gets a stable number across the whole document.
 *   2. Convert leaked LaTeX-style math fragments into plain Unicode where safe
 *      (e.g. `50.85^\circ \text{F}` → `50.85°F`), so readers never see raw TeX.
 */

const URL_CITATION_RE = /\[((?:https?:\/\/[^\s\]]+(?:\s*,\s*)?)+)\]/g;

const SUPER_DIGITS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

function toSuper(n: number): string {
  return String(n)
    .split("")
    .map((d) => SUPER_DIGITS[d] ?? d)
    .join("");
}

function buildSupMarkdown(urls: string[], registry: Map<string, number>): string {
  const parts: string[] = [];
  for (const rawUrl of urls) {
    const url = rawUrl.trim();
    if (!url) continue;
    let n = registry.get(url);
    if (!n) {
      n = registry.size + 1;
      registry.set(url, n);
    }
    parts.push(`[${toSuper(n)}](${url})`);
  }
  if (parts.length === 0) return "";
  return parts.join("");
}

function replaceCitations(input: string): string {
  const registry = new Map<string, number>();
  const withSups = input.replace(URL_CITATION_RE, (match, group: string) => {
    const urls = group
      .split(/\s*,\s*/)
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//.test(u));
    if (urls.length === 0) return match;
    return buildSupMarkdown(urls, registry);
  });
  return withSups;
}

const LATEX_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\^\\circ\s*\\text\{C\}/g, "°C"],
  [/\^\\circ\s*\\text\{F\}/g, "°F"],
  [/\^\\circ/g, "°"],
  [/\\text\{([^}]*)\}/g, "$1"],
  [/\\textbf\{([^}]*)\}/g, "$1"],
  [/\\times/g, "×"],
  [/\\approx/g, "≈"],
  [/\\geq/g, "≥"],
  [/\\leq/g, "≤"],
  [/\\pm/g, "±"],
  [/\\%/g, "%"],
  [/\\\$/g, "$"],
];

function stripLatex(input: string): string {
  let out = input;
  for (const [re, sub] of LATEX_REPLACEMENTS) {
    out = out.replace(re, sub);
  }
  // Inline math delimiters \( ... \) and $ ... $ — pull contents out, drop wrappers.
  out = out.replace(/\\\(([^)]*)\\\)/g, "$1");
  // Leave $ ... $ alone unless it clearly wraps a math fragment with \ commands;
  // safer not to touch general $ text usage.
  return out;
}

export function preprocessArticleMarkdown(content: string): string {
  if (!content) return content;
  return replaceCitations(stripLatex(content));
}
