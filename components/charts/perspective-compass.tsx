"use client";

import { useMemo, useState } from "react";
import { MarkdownBody } from "@/components/markdown-body";
import {
  alignmentToOffset,
  roleColor,
  roleLabel,
} from "./lib/colors";
import { pointOnCircle, radialClusterLayout } from "./lib/layout";

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

type Props = {
  spectrum: SpectrumEntry[] | null;
  sources: SourceDetail[];
  sourceBalanceSummary: string | null;
  articleAlignmentLabel: string | null;
  articleAlignmentConfidence: number | null;
  articleAlignmentRationale: string | null;
};

const VIEW_W = 760;
const VIEW_H = 520;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2 + 6;
const R_INNER = 64;
const R_RING = 90;
const R_NODE_BASE = 170;

export function PerspectiveCompass(props: Props) {
  const {
    spectrum,
    sources,
    sourceBalanceSummary,
    articleAlignmentLabel,
    articleAlignmentConfidence,
    articleAlignmentRationale,
  } = props;

  const entries = useMemo(() => (spectrum || []).filter((e) => e && e.source), [spectrum]);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, SpectrumEntry[]>();
    for (const e of entries) {
      const role = (e.stakeholder_role || "unknown").toLowerCase();
      if (!map.has(role)) map.set(role, []);
      map.get(role)!.push(e);
    }
    return [...map.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([role, items]) => ({ key: role, items, size: items.length }));
  }, [entries]);

  const wedges = useMemo(() => radialClusterLayout(groups, CX, CY, R_NODE_BASE), [groups]);

  const articleOffset = alignmentToOffset(articleAlignmentLabel);
  const confidencePct = articleAlignmentConfidence != null ? Math.max(0, Math.min(1, articleAlignmentConfidence)) : null;

  const entryPositions = useMemo(() => {
    const out = new Map<string, { x: number; y: number; angle: number; color: string; group: string }>();
    for (const g of groups) {
      const wedge = wedges.get(g.key);
      if (!wedge) continue;
      const span = wedge.endAngle - wedge.startAngle;
      g.items.forEach((entry, i) => {
        const t = g.items.length === 1 ? 0.5 : i / (g.items.length - 1);
        const angle = wedge.startAngle + span * t;
        const offsetDelta = alignmentToOffset(entry.alignment_label) - articleOffset;
        const radius = R_NODE_BASE + Math.min(Math.abs(offsetDelta), 2) * 24;
        const { x, y } = pointOnCircle(CX, CY, radius, angle);
        out.set(entry.url || `${entry.source}-${i}`, { x, y, angle, color: roleColor(g.key), group: g.key });
      });
    }
    return out;
  }, [groups, wedges, articleOffset]);

  const activeEntry = activeUrl ? entries.find((e) => (e.url || e.source) === activeUrl) : null;

  return (
    <section aria-labelledby="pc-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="pc-heading" className="font-mono text-xs font-medium uppercase tracking-[0.28em] text-[#e0e0e0]/70 sm:text-sm">
          Perspective Compass
        </h2>
        {articleAlignmentLabel ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888] sm:text-[11px]">
            article: {articleAlignmentLabel}
            {confidencePct != null ? ` · ${Math.round(confidencePct * 100)}% conf` : ""}
          </span>
        ) : null}
      </div>
      <p className="mt-1 font-mono text-[11px] text-[#888] sm:text-xs">
        Sources arranged by stakeholder role. Distance from center grows with framing distance from this article.
      </p>

      {entries.length > 0 ? (
        <div className="panel mt-3 border-[#00e8ff]/15 bg-black/40 p-2 sm:p-4">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="block h-auto w-full"
            role="img"
            aria-label={`Perspective compass: ${entries.length} sources across ${groups.length} stakeholder roles`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="pc-center" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(0,232,255,0.18)" />
                <stop offset="60%" stopColor="rgba(0,232,255,0.04)" />
                <stop offset="100%" stopColor="rgba(0,232,255,0)" />
              </radialGradient>
              <radialGradient id="pc-node-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>

            {/* concentric guides */}
            {[0.55, 0.78, 1.0, 1.18].map((t, i) => (
              <circle
                key={i}
                cx={CX}
                cy={CY}
                r={R_NODE_BASE * t}
                fill="none"
                stroke="rgba(0,232,255,0.07)"
                strokeDasharray="2 5"
              />
            ))}

            {/* role wedge arcs */}
            {groups.map((g) => {
              const w = wedges.get(g.key);
              if (!w) return null;
              const start = pointOnCircle(CX, CY, R_NODE_BASE * 1.32, w.startAngle);
              const end = pointOnCircle(CX, CY, R_NODE_BASE * 1.32, w.endAngle);
              const large = w.endAngle - w.startAngle > Math.PI ? 1 : 0;
              const midAngle = (w.startAngle + w.endAngle) / 2;
              const labelP = pointOnCircle(CX, CY, R_NODE_BASE * 1.46, midAngle);
              return (
                <g key={g.key}>
                  <path
                    d={`M ${start.x} ${start.y} A ${R_NODE_BASE * 1.32} ${R_NODE_BASE * 1.32} 0 ${large} 1 ${end.x} ${end.y}`}
                    fill="none"
                    stroke={roleColor(g.key)}
                    strokeOpacity="0.5"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <text
                    x={labelP.x}
                    y={labelP.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="ui-monospace, monospace"
                    fontSize="10"
                    fill={roleColor(g.key)}
                    opacity="0.85"
                    letterSpacing="1"
                  >
                    {roleLabel(g.key).toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* connector spokes */}
            {entries.map((e, i) => {
              const key = e.url || `${e.source}-${i}`;
              const pos = entryPositions.get(key);
              if (!pos) return null;
              const isActive = activeUrl === key;
              return (
                <line
                  key={`spoke-${i}`}
                  x1={CX + (R_RING - 2) * Math.cos(pos.angle)}
                  y1={CY + (R_RING - 2) * Math.sin(pos.angle)}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={pos.color}
                  strokeOpacity={isActive ? 0.85 : 0.35}
                  strokeWidth={isActive ? 1.5 : 1}
                />
              );
            })}

            {/* center disc */}
            <circle cx={CX} cy={CY} r={R_RING + 14} fill="url(#pc-center)" />
            {confidencePct != null ? (
              <circle
                cx={CX}
                cy={CY}
                r={R_RING}
                fill="none"
                stroke="#00e8ff"
                strokeWidth="2"
                strokeDasharray={`${(2 * Math.PI * R_RING) * confidencePct} ${(2 * Math.PI * R_RING) * (1 - confidencePct)}`}
                strokeDashoffset={(2 * Math.PI * R_RING) * 0.25}
                opacity="0.85"
                strokeLinecap="round"
              />
            ) : (
              <circle cx={CX} cy={CY} r={R_RING} fill="none" stroke="#00e8ff" strokeOpacity="0.4" strokeDasharray="2 4" />
            )}
            <circle cx={CX} cy={CY} r={R_INNER} fill="#0a0d14" stroke="rgba(0,232,255,0.4)" />
            <text
              x={CX}
              y={CY - 4}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fontSize="11"
              fill="#bc13fe"
              letterSpacing="2"
            >
              ARTICLE
            </text>
            <text
              x={CX}
              y={CY + 14}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fontSize="14"
              fontWeight="600"
              fill="#e9f6f8"
            >
              {(articleAlignmentLabel || "n/a").toString().toUpperCase()}
            </text>
            {confidencePct != null ? (
              <text
                x={CX}
                y={CY + 30}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize="10"
                fill="#7aaab2"
              >
                {Math.round(confidencePct * 100)}% confidence
              </text>
            ) : null}

            {/* entry nodes */}
            {entries.map((e, i) => {
              const key = e.url || `${e.source}-${i}`;
              const pos = entryPositions.get(key);
              if (!pos) return null;
              const isActive = activeUrl === key;
              return (
                <g
                  key={`node-${i}`}
                  transform={`translate(${pos.x} ${pos.y})`}
                  onMouseEnter={() => setActiveUrl(key)}
                  onMouseLeave={() => setActiveUrl((p) => (p === key ? null : p))}
                  onClick={() => setActiveUrl((p) => (p === key ? null : key))}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      setActiveUrl((p) => (p === key ? null : key));
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${e.source}, ${roleLabel(e.stakeholder_role)}, ${e.alignment_label || "alignment unknown"}`}
                  className="cursor-pointer outline-none"
                  style={{ pointerEvents: "all" }}
                >
                  <circle r={isActive ? 10 : 7} fill={pos.color} opacity={isActive ? 0.25 : 0.15} />
                  <circle r={isActive ? 6 : 4.5} fill={pos.color} stroke="#0a0d14" strokeWidth="1.5" />
                  <circle r={isActive ? 6 : 4.5} fill="url(#pc-node-glow)" />
                  <text
                    x={Math.cos(pos.angle) >= 0 ? 10 : -10}
                    y={4}
                    textAnchor={Math.cos(pos.angle) >= 0 ? "start" : "end"}
                    fontFamily="ui-monospace, monospace"
                    fontSize="10.5"
                    fill={isActive ? "#e9f6f8" : "#a7b0ba"}
                  >
                    {e.source}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : null}

      {activeEntry ? (
        <div className="panel mt-3 border-[#00e8ff]/30 bg-black/55 p-3 sm:p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] sm:text-[11px]"
            style={{ color: roleColor(activeEntry.stakeholder_role) }}>
            {activeEntry.source} · {roleLabel(activeEntry.stakeholder_role)} · {activeEntry.alignment_label}
          </p>
          {activeEntry.editorial_frame ? (
            <p className="mt-2 text-sm leading-relaxed text-[#cfd8e0]">{activeEntry.editorial_frame}</p>
          ) : null}
          {activeEntry.url ? (
            <a
              href={activeEntry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-mono text-[11px] text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-2"
            >
              Open source ↗
            </a>
          ) : null}
        </div>
      ) : null}

      {(sourceBalanceSummary || articleAlignmentRationale) ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sourceBalanceSummary ? (
            <div className="rounded-md border border-[#00e8ff]/15 bg-black/30 p-3 sm:p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bc13fe] sm:text-[11px]">
                Source mix
              </p>
              <div className="mt-2 text-sm leading-relaxed text-[#b7dbe2]">
                <MarkdownBody content={sourceBalanceSummary} />
              </div>
            </div>
          ) : null}
          {articleAlignmentRationale ? (
            <div className="rounded-md border border-[#00e8ff]/15 bg-black/30 p-3 sm:p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bc13fe] sm:text-[11px]">
                Why this alignment
              </p>
              <div className="mt-2 text-sm leading-relaxed text-[#b7dbe2]">
                <MarkdownBody content={articleAlignmentRationale} />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="mt-3 font-mono text-[10px] text-[#666] sm:text-[11px]">
        Labels are heuristic model estimates. Evaluate sources yourself.
      </p>

      {sources.length > 0 ? (
        <details className="mt-4">
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-widest text-[#888] hover:text-[#cfd8e0] sm:text-xs">
            Source detail table
          </summary>
          <div className="mt-2 overflow-x-auto">
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
                  <tr key={s.url} className="border-b border-[#00e8ff]/10">
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
                    <td className="py-2 pr-3 text-[#a0a0a0]">{roleLabel(s.stakeholderRole || "unknown")}</td>
                    <td className="py-2 pr-3">
                      {s.alignmentLabel || "—"}
                      {s.alignmentConfidence != null ? ` (${s.alignmentConfidence})` : ""}
                    </td>
                    <td className="py-2 text-[#9a9a9a]">{s.alignmentRationale || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </section>
  );
}
