"use client";

import { useState } from "react";

type SpectrumEntry = {
  source: string;
  url: string;
  stakeholder_role: string;
  editorial_frame: string;
  alignment_label: string;
};

type SourceDetail = {
  url: string;
  title: string | null;
  alignmentLabel: string | null;
  alignmentConfidence: number | null;
  alignmentRationale: string | null;
  stakeholderRole?: string | null;
  editorialFrame?: string | null;
};

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

function roleLabel(role: string): string {
  return ROLE_LABELS[role] || role.replace(/_/g, " ");
}

export function PerspectiveSpectrum({
  spectrum,
  sources,
  sourceBalanceSummary,
  articleAlignmentLabel,
  articleAlignmentConfidence,
  articleAlignmentRationale,
}: {
  spectrum: SpectrumEntry[] | null;
  sources: SourceDetail[];
  sourceBalanceSummary: string | null;
  articleAlignmentLabel: string | null;
  articleAlignmentConfidence: number | null;
  articleAlignmentRationale: string | null;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const hasSpectrum = spectrum && spectrum.length > 0;

  const grouped: Record<string, SpectrumEntry[]> = {};
  if (hasSpectrum) {
    for (const entry of spectrum) {
      const role = entry.stakeholder_role || "unknown";
      if (!grouped[role]) grouped[role] = [];
      grouped[role].push(entry);
    }
  }

  return (
    <section>
      <h2 className="mb-2 font-mono text-xs font-medium uppercase tracking-widest text-[#e0e0e0]/70 sm:text-sm">
        Source Perspectives
      </h2>
      <p className="mb-4 font-mono text-[11px] text-[#888] sm:text-xs">
        Automated assessment — not a statement of fact. Overall:{" "}
        <strong className="text-[#e9f6f8]">{articleAlignmentLabel || "unknown"}</strong>
        {articleAlignmentConfidence != null ? ` (${articleAlignmentConfidence})` : ""}
      </p>
      {articleAlignmentRationale && (
        <p className="mb-4 text-sm leading-relaxed text-[#b7dbe2]">{articleAlignmentRationale}</p>
      )}

      {hasSpectrum && (
        <div className="space-y-3">
          {Object.entries(grouped).map(([role, entries]) => (
            <div key={role} className="panel border-[#00e8ff]/12 p-3 sm:p-4">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#bc13fe] sm:text-xs">
                {roleLabel(role)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {entries.map((entry, idx) => (
                  <button
                    key={idx}
                    className={`rounded border px-2 py-1 font-mono text-[11px] transition-colors sm:text-xs ${
                      expanded === entry.url
                        ? "border-[#00e8ff]/60 bg-[#00e8ff]/10 text-[#00e8ff]"
                        : "border-[#00e8ff]/20 text-[#a0a0a0] hover:border-[#00e8ff]/40 hover:text-[#e0e0e0]"
                    }`}
                    onClick={() => setExpanded(expanded === entry.url ? null : entry.url)}
                  >
                    {entry.source}
                  </button>
                ))}
              </div>
              {entries.map(
                (entry, idx) =>
                  expanded === entry.url &&
                  entry.editorial_frame && (
                    <p
                      key={`frame-${idx}`}
                      className="mt-2 rounded bg-[#00e8ff]/5 p-2 text-xs leading-relaxed text-[#b7dbe2]"
                    >
                      {entry.editorial_frame}
                    </p>
                  ),
              )}
            </div>
          ))}
        </div>
      )}

      {sourceBalanceSummary && (
        <p className="mt-4 text-sm leading-relaxed text-[#b7dbe2]">{sourceBalanceSummary}</p>
      )}

      <p className="mt-4 font-mono text-[10px] text-[#666] sm:text-[11px]">
        Labels are heuristic model estimates. Evaluate sources yourself.
      </p>

      {sources.length > 0 && (
        <>
          <h3 className="mb-2 mt-6 font-mono text-xs font-medium uppercase tracking-widest text-[#e0e0e0]/70 sm:text-sm">
            Source detail
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#00e8ff]/20 text-left font-mono text-[10px] uppercase tracking-wider text-[#888]">
                  <th className="pb-2 pr-3">Source</th>
                  <th className="pb-2 pr-3">Role</th>
                  <th className="pb-2 pr-3">Alignment</th>
                  <th className="pb-2">Rationale</th>
                </tr>
              </thead>
              <tbody className="text-[#b7dbe2]">
                {sources.map((s) => (
                  <tr key={s.url} className="border-b border-[#00e8ff]/8">
                    <td className="py-2 pr-3">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-2 hover:decoration-[#bc13fe]"
                      >
                        {s.title || s.url.slice(0, 40)}
                      </a>
                    </td>
                    <td className="py-2 pr-3 text-[#a0a0a0]">
                      {roleLabel(s.stakeholderRole || "unknown")}
                    </td>
                    <td className="py-2 pr-3">
                      {s.alignmentLabel || "\u2014"}
                      {s.alignmentConfidence != null ? ` (${s.alignmentConfidence})` : ""}
                    </td>
                    <td className="py-2 text-[#9a9a9a]">{s.alignmentRationale || "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
