"use client";

import { useMemo, useState } from "react";
import {
  bipartiteY,
  claimDomainEdges,
  domainOf,
  domainsFromClaims,
  normalizeClaims,
  type NormClaim,
  type DomainNode,
} from "./lib/layout";
import { tierColor, tierLabel } from "./lib/colors";

const VIEW_W = 1000;
const COL_LEFT_X = 240;
const COL_RIGHT_X = 760;
const ROW_GAP = 38;
const PAD_Y = 36;

function claimRadius(c: NormClaim): number {
  return 7 + Math.min(c.totalSources * 1.4, 16);
}

function domainRadius(d: DomainNode): number {
  return 6 + Math.min(d.totalCount * 1.6, 14);
}

export function ClaimSourceNetwork({ claimMap }: { claimMap: unknown }) {
  const claims = useMemo(() => normalizeClaims(claimMap), [claimMap]);
  const domains = useMemo(() => domainsFromClaims(claims), [claims]);
  const edges = useMemo(() => claimDomainEdges(claims), [claims]);
  const [activeClaim, setActiveClaim] = useState<string | null>(null);
  const [hoverDomain, setHoverDomain] = useState<string | null>(null);

  if (claims.length === 0 || domains.length === 0) return null;

  const rows = Math.max(claims.length, domains.length);
  const VIEW_H = PAD_Y * 2 + Math.max(0, rows - 1) * ROW_GAP;

  const claimY = new Map<string, number>();
  claims.forEach((c, i) => claimY.set(c.id, bipartiteY(i, claims.length, PAD_Y, VIEW_H - PAD_Y)));
  const domainY = new Map<string, number>();
  domains.forEach((d, i) => domainY.set(d.domain, bipartiteY(i, domains.length, PAD_Y, VIEW_H - PAD_Y)));

  const activeClaimObj = activeClaim ? claims.find((c) => c.id === activeClaim) || null : null;

  const ariaDesc = `${claims.length} claims connected to ${domains.length} unique source domains via ${edges.length} citations.`;

  return (
    <section aria-labelledby="csn-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="csn-heading" className="font-mono text-xs font-medium uppercase tracking-[0.28em] text-[#e0e0e0]/70 sm:text-sm">
          Claim ↔ Source Network
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888] sm:text-[11px]">
          {claims.length} ↔ {domains.length}
        </span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-[#888] sm:text-xs">
        Each claim wires out to the source domains that support or contradict it. Click a claim for context.
      </p>

      <div className="panel mt-3 border-[#00e8ff]/15 bg-black/40 p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block h-auto w-full"
          role="img"
          aria-label={ariaDesc}
          preserveAspectRatio="xMidYMid meet"
        >
          <title>Claim to source network</title>
          <desc>{ariaDesc}</desc>
          <defs>
            <linearGradient id="csn-support" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3a8" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#22d3a8" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="csn-contradict" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#bc13fe" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#bc13fe" stopOpacity="0.05" />
            </linearGradient>
            <radialGradient id="csn-node-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          {/* axis spines */}
          <line x1={COL_LEFT_X} y1={PAD_Y - 18} x2={COL_LEFT_X} y2={VIEW_H - PAD_Y + 18}
            stroke="rgba(0,232,255,0.18)" strokeDasharray="2 4" />
          <line x1={COL_RIGHT_X} y1={PAD_Y - 18} x2={COL_RIGHT_X} y2={VIEW_H - PAD_Y + 18}
            stroke="rgba(188,19,254,0.18)" strokeDasharray="2 4" />

          {/* column headers */}
          <text x={COL_LEFT_X} y={18} textAnchor="middle"
            fontFamily="ui-monospace, monospace" fontSize="11" fill="#7aaab2"
            letterSpacing="2">CLAIMS</text>
          <text x={COL_RIGHT_X} y={18} textAnchor="middle"
            fontFamily="ui-monospace, monospace" fontSize="11" fill="#bc13fe"
            letterSpacing="2">SOURCES</text>

          {/* edges */}
          <g>
            {edges.map((e, i) => {
              const y1 = claimY.get(e.claimId) ?? 0;
              const y2 = domainY.get(e.domain) ?? 0;
              const midX = (COL_LEFT_X + COL_RIGHT_X) / 2;
              const isActive = activeClaim ? e.claimId === activeClaim : hoverDomain ? e.domain === hoverDomain : false;
              const dimmed = (activeClaim || hoverDomain) && !isActive;
              const stroke = e.kind === "support" ? "url(#csn-support)" : "url(#csn-contradict)";
              const baseOpacity = e.kind === "support" ? 0.55 : 0.65;
              return (
                <path
                  key={i}
                  d={`M ${COL_LEFT_X + 1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${COL_RIGHT_X - 1} ${y2}`}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={isActive ? 2 : 1}
                  opacity={dimmed ? 0.08 : baseOpacity}
                  pointerEvents="none"
                />
              );
            })}
          </g>

          {/* claim nodes */}
          <g>
            {claims.map((c) => {
              const y = claimY.get(c.id) ?? 0;
              const r = claimRadius(c);
              const color = tierColor(c.tier);
              const isActive = activeClaim === c.id;
              return (
                <g
                  key={c.id}
                  transform={`translate(${COL_LEFT_X} ${y})`}
                  onMouseEnter={() => setActiveClaim(c.id)}
                  onMouseLeave={() => setActiveClaim((prev) => (prev === c.id ? null : prev))}
                  onClick={() => setActiveClaim((prev) => (prev === c.id ? null : c.id))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveClaim((prev) => (prev === c.id ? null : c.id));
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Claim ${c.index + 1}: ${c.tier}. ${c.supporting.length} supporting, ${c.contradicting.length} contradicting.`}
                  className="cursor-pointer outline-none focus-visible:[&>circle]:stroke-white"
                  style={{ pointerEvents: "all" }}
                >
                  <circle r={r + 4} fill={color} opacity={isActive ? 0.25 : 0.1} />
                  <circle r={r} fill={color} opacity="0.92" stroke={isActive ? "#ffffff" : "rgba(0,0,0,0.4)"} strokeWidth="1.5" />
                  <circle r={r} fill="url(#csn-node-glow)" />
                  <text
                    x={-r - 8}
                    y={4}
                    textAnchor="end"
                    fontFamily="ui-monospace, monospace"
                    fontSize="11"
                    fill={isActive ? "#e9f6f8" : "#9aa6b0"}
                  >
                    {`#${c.index + 1}`}
                  </text>
                  <text
                    x={r + 8}
                    y={4}
                    fontFamily="ui-monospace, monospace"
                    fontSize="10"
                    fill="#5d6770"
                  >
                    {tierLabel(c.tier)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* domain nodes */}
          <g>
            {domains.map((d) => {
              const y = domainY.get(d.domain) ?? 0;
              const r = domainRadius(d);
              const isActive = hoverDomain === d.domain || (activeClaimObj &&
                (activeClaimObj.supporting.some((u) => u.includes(d.domain)) ||
                  activeClaimObj.contradicting.some((u) => u.includes(d.domain))));
              return (
                <g
                  key={d.domain}
                  transform={`translate(${COL_RIGHT_X} ${y})`}
                  onMouseEnter={() => setHoverDomain(d.domain)}
                  onMouseLeave={() => setHoverDomain((prev) => (prev === d.domain ? null : prev))}
                  onClick={() => window.open(d.exampleUrl, "_blank", "noopener,noreferrer")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      window.open(d.exampleUrl, "_blank", "noopener,noreferrer");
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  aria-label={`Open source: ${d.domain}, cited in ${d.totalCount} claim connections`}
                  className="cursor-pointer outline-none"
                  style={{ pointerEvents: "all" }}
                >
                  <circle r={r + 4} fill="#bc13fe" opacity={isActive ? 0.22 : 0.08} />
                  <circle r={r} fill="#0a0d14" stroke="#bc13fe" strokeWidth={isActive ? 2 : 1.25} />
                  <circle r={r} fill="url(#csn-node-glow)" opacity="0.5" />
                  <text
                    x={r + 8}
                    y={4}
                    fontFamily="ui-monospace, monospace"
                    fontSize="11"
                    fill={isActive ? "#e9f6f8" : "#a7b0ba"}
                  >
                    {d.domain}
                  </text>
                  <text
                    x={-r - 6}
                    y={4}
                    textAnchor="end"
                    fontFamily="ui-monospace, monospace"
                    fontSize="10"
                    fill="#5d6770"
                  >
                    {d.totalCount}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 px-2 font-mono text-[10px] text-[#888] sm:text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="block h-0.5 w-6" style={{ background: "linear-gradient(90deg, transparent, #22d3a8)" }} />
            supports
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="block h-0.5 w-6" style={{ background: "linear-gradient(90deg, #bc13fe, transparent)" }} />
            contradicts
          </span>
          <span className="text-[#555]">·</span>
          <span>node size = citations</span>
        </div>
      </div>

      {activeClaimObj ? (
        <div className="panel mt-3 border-[#00e8ff]/30 bg-black/55 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] sm:text-[11px]"
                style={{ color: tierColor(activeClaimObj.tier) }}>
                Claim #{activeClaimObj.index + 1} · {tierLabel(activeClaimObj.tier)}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#e0e0e0]">{activeClaimObj.claim}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveClaim(null)}
              className="shrink-0 rounded border border-[#00e8ff]/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#a0a0a0] hover:border-[#00e8ff]/60 hover:text-[#e0e0e0]"
            >
              Close
            </button>
          </div>
          {activeClaimObj.whoBenefits ? (
            <p className="mt-2 text-xs text-[#a0a0a0]">
              <span className="font-mono text-[#666]">Who benefits: </span>
              {activeClaimObj.whoBenefits}
            </p>
          ) : null}
          {activeClaimObj.whatIsMissing ? (
            <p className="mt-1 text-xs text-[#a0a0a0]">
              <span className="font-mono text-[#666]">What&apos;s missing: </span>
              {activeClaimObj.whatIsMissing}
            </p>
          ) : null}
        </div>
      ) : null}

      <details className="mt-3 text-[#a0a0a0]">
        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] text-[#666] hover:text-[#a0a0a0] sm:text-[11px]">
          Read as text
        </summary>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs">
          {claims.map((c) => (
            <li key={c.id}>
              <span className="text-[#cfd8e0]">{c.claim}</span>{" "}
              <span className="font-mono text-[10px] text-[#666]">[{tierLabel(c.tier)}]</span>
              {c.supporting.length > 0 ? (
                <span className="mt-0.5 block text-[10px]">
                  <span className="text-[#666]">Supported by: </span>
                  {c.supporting.map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noopener noreferrer"
                      className="mr-1.5 text-[#22d3a8] underline decoration-[#22d3a8]/30 underline-offset-2">
                      {domainOf(u)}
                    </a>
                  ))}
                </span>
              ) : null}
              {c.contradicting.length > 0 ? (
                <span className="mt-0.5 block text-[10px]">
                  <span className="text-[#666]">Contradicted by: </span>
                  {c.contradicting.map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noopener noreferrer"
                      className="mr-1.5 text-[#bc13fe] underline decoration-[#bc13fe]/30 underline-offset-2">
                      {domainOf(u)}
                    </a>
                  ))}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
