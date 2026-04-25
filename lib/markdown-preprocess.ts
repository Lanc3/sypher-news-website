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

// Matches AI-leaked patterns like:
//   [Source: cnet.com](https://example.com/path)
//   [source: example.com](https://example.com)
// — replaced with a numbered superscript pointing to the URL.
const SOURCE_LABEL_LINK_RE = /\[\s*[Ss]ource:\s*[^\]]+\]\(\s*(https?:\/\/[^\s)]+)\s*\)/g;

// Matches the "Further Reading" footer pattern with mismatched bracket+paren:
//   [https://example.com/path] (https://example.com/path)
// (the URL repeats inside both brackets and parens with whitespace between them).
const BRACKET_PAREN_LINK_RE = /\[\s*(https?:\/\/[^\s\]]+)\s*\]\s*\(\s*\1\s*\)/g;

function replaceCitations(input: string): string {
  const registry = new Map<string, number>();

  // Step 1: collapse "[https://x] (https://x)" → "[https://x]" so the
  // standard bracket-citation pass below can convert it to a superscript.
  let working = input.replace(BRACKET_PAREN_LINK_RE, "[$1]");

  // Step 2: convert "[Source: domain](url)" → numbered superscript link.
  working = working.replace(SOURCE_LABEL_LINK_RE, (_match, url: string) => {
    return buildSupMarkdown([url], registry);
  });

  // Step 3: convert bare "[https://...]" / "[https://...,https://...]" citations.
  working = working.replace(URL_CITATION_RE, (match, group: string) => {
    const urls = group
      .split(/\s*,\s*/)
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//.test(u));
    if (urls.length === 0) return match;
    return buildSupMarkdown(urls, registry);
  });

  // Step 4: clean stray trailing `]` immediately after a markdown link
  // (pattern: "](url)]" — common AI typo where bracket nesting got confused).
  working = working.replace(/(\]\([^)]+\))\]/g, "$1");

  return working;
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

// AI-pipeline articles often open with a meta-header like
// "# How Sources Framed This" — second-order analysis of other coverage rather
// than a news lede. To improve perceived value (and AdSense compliance), when
// the body opens that way and we have an article summary, prepend the summary
// as a "Lede" section and rename the meta-header to a less prominent H2.
const META_OPENING_HEADERS = [
  /^#\s+How Sources Framed This\b/m,
  /^#\s+Whose Voice Is Missing\b/m,
  /^#\s+Media Coverage\b/im,
  /^#\s+Coverage\b/im,
];

export function ensureLedeOpening(bodyMarkdown: string, summary: string | null | undefined): string {
  if (!bodyMarkdown) return bodyMarkdown;
  const trimmed = bodyMarkdown.trimStart();
  const hasMetaOpening = META_OPENING_HEADERS.some((re) => re.test(trimmed.split("\n").slice(0, 2).join("\n")));
  if (!hasMetaOpening) return bodyMarkdown;
  const cleanSummary = (summary ?? "").trim();
  const lede = cleanSummary
    ? `${cleanSummary}\n\n## Source Comparison\n\n`
    : `## Source Comparison\n\n`;
  // Demote the leaked H1 to an H2 (we just inserted our own H2 above), and
  // demote the "Whose Voice Is Missing" H1 → H2 too so the document has a
  // single logical heading hierarchy.
  let rewritten = trimmed
    .replace(/^#\s+How Sources Framed This\b/m, "")
    .replace(/^#\s+Whose Voice Is Missing\b/m, "## Gaps in Coverage");
  rewritten = rewritten.replace(/^\s*\n+/, "");
  return `${lede}${rewritten}`;
}
