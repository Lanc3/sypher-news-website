"use client";

import { useMemo, useState } from "react";
import { tierColor, tierLabel, tierToY, type ConfidenceTier } from "./lib/colors";
import { normalizeClaims, type NormClaim } from "./lib/layout";

const VIEW_W = 760;
const VIEW_H = 380;
const PAD_L = 130;
const PAD_R = 30;
const PAD_T = 30;
const PAD_B = 50;

const TIERS: ConfidenceTier[] = ["UNVERIFIABLE", "SINGLE SOURCE", "PARTIALLY VERIFIED", "VERIFIED"];

export function EvidenceRiskMap({ claimMap }: { claimMap: unknown }) {
  const claims = useMemo(() => normalizeClaims(claimMap), [claimMap]);
  const [active, setActive] = useState<string | null>(null);

  const maxSources = Math.max(2, ...claims.map((c) => c.totalSources), 2);
  const innerW = VIEW_W - PAD_L - PAD_R;
  const innerH = VIEW_H - PAD_T - PAD_B;

  const xScale = useMemo(
    () => (n: number) => PAD_L + (n / maxSources) * innerW,
    [maxSources, innerW],
  );
  const yScale = useMemo(
    () => (tier: ConfidenceTier) => PAD_T + (1 - tierToY(tier) / 3) * innerH,
    [innerH],
  );

  const positions = useMemo(() => {
    const groupCount = new Map<string, number>();
    return claims.map((c) => {
      const key = `${c.tier}:${c.totalSources}`;
      const seen = groupCount.get(key) || 0;
      groupCount.set(key, seen + 1);
      const offset = seen === 0 ? 0 : ((seen % 2 === 0 ? 1 : -1) * Math.ceil(seen / 2)) * 9;
      return { claim: c, x: xScale(c.totalSources), y: yScale(c.tier) + offset };
    });
  }, [claims, xScale, yScale]);

  if (claims.length === 0) return null;

  const fragileX = xScale(2);
  const strongX = xScale(maxSources * 0.6);
  const fragileY = yScale("SINGLE SOURCE");
  const strongY = yScale("PARTIALLY VERIFIED");

  return (
    <section aria-labelledby="erm-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="erm-heading" className="font-mono text-xs font-medium uppercase tracking-[0.28em] text-[#e0e0e0]/70 sm:text-sm">
          Evidence Risk Map
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888] sm:text-[11px]">
          {claims.length} claims plotted
        </span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-[#888] sm:text-xs">
        Verifiability vs. source count. Lower-left is fragile; upper-right is strong consensus.
      </p>

      <div className="panel mt-3 border-[#00e8ff]/15 bg-black/40 p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`Risk map of ${claims.length} claims by source count and confidence tier`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="erm-fragile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(188,19,254,0.04)" />
              <stop offset="100%" stopColor="rgba(188,19,254,0.18)" />
            </linearGradient>
            <linearGradient id="erm-strong" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(0,232,255,0.04)" />
              <stop offset="100%" stopColor="rgba(0,232,255,0.16)" />
            </linearGradient>
            <radialGradient id="erm-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          {/* fragile shading: low x, low y */}
          <rect x={PAD_L} y={fragileY} width={fragileX - PAD_L} height={VIEW_H - PAD_B - fragileY} fill="url(#erm-fragile)" />
          {/* strong shading: high x, high y */}
          <rect x={strongX} y={PAD_T} width={VIEW_W - PAD_R - strongX} height={strongY - PAD_T} fill="url(#erm-strong)" />

          {/* axes */}
          <line x1={PAD_L} y1={VIEW_H - PAD_B} x2={VIEW_W - PAD_R} y2={VIEW_H - PAD_B} stroke="rgba(0,232,255,0.25)" />
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={VIEW_H - PAD_B} stroke="rgba(0,232,255,0.25)" />

          {/* y tick labels (tiers) */}
          {TIERS.map((t) => {
            const y = yScale(t);
            return (
              <g key={t}>
                <line x1={PAD_L - 4} y1={y} x2={PAD_L} y2={y} stroke="rgba(0,232,255,0.3)" />
                <line x1={PAD_L} y1={y} x2={VIEW_W - PAD_R} y2={y}
                  stroke="rgba(0,232,255,0.06)" strokeDasharray="2 6" />
                <text x={PAD_L - 10} y={y + 3} textAnchor="end"
                  fontFamily="ui-monospace, monospace" fontSize="10" fill={tierColor(t)} opacity="0.85">
                  {tierLabel(t).toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* x ticks */}
          {Array.from({ length: maxSources + 1 }, (_, i) => i).filter((n) => n === 0 || n === maxSources || n % Math.max(1, Math.floor(maxSources / 5)) === 0).map((n) => {
            const x = xScale(n);
            return (
              <g key={n}>
                <line x1={x} y1={VIEW_H - PAD_B} x2={x} y2={VIEW_H - PAD_B + 4} stroke="rgba(0,232,255,0.3)" />
                <text x={x} y={VIEW_H - PAD_B + 16} textAnchor="middle"
                  fontFamily="ui-monospace, monospace" fontSize="10" fill="#7aaab2">{n}</text>
              </g>
            );
          })}

          {/* axis labels */}
          <text
            x={PAD_L + innerW / 2}
            y={VIEW_H - 14}
            textAnchor="middle"
            fontFamily="ui-monospace, monospace"
            fontSize="10"
            fill="#888"
            letterSpacing="2"
          >
            SOURCE COUNT →
          </text>
          <text
            x={-PAD_T - innerH / 2}
            y={18}
            textAnchor="middle"
            fontFamily="ui-monospace, monospace"
            fontSize="10"
            fill="#888"
            letterSpacing="2"
            transform="rotate(-90)"
          >
            ← VERIFIABILITY
          </text>

          {/* quadrant labels */}
          <text x={PAD_L + 8} y={VIEW_H - PAD_B - 8}
            fontFamily="ui-monospace, monospace" fontSize="10" fill="#bc13fe" opacity="0.7" letterSpacing="2">
            FRAGILE
          </text>
          <text x={VIEW_W - PAD_R - 8} y={PAD_T + 14} textAnchor="end"
            fontFamily="ui-monospace, monospace" fontSize="10" fill="#00e8ff" opacity="0.85" letterSpacing="2">
            STRONG CONSENSUS
          </text>

          {/* points */}
          {positions.map(({ claim, x, y }) => {
            const isActive = active === claim.id;
            const color = tierColor(claim.tier);
            return (
              <g
                key={claim.id}
                transform={`translate(${x} ${y})`}
                onMouseEnter={() => setActive(claim.id)}
                onMouseLeave={() => setActive((p) => (p === claim.id ? null : p))}
                onClick={() => setActive((p) => (p === claim.id ? null : claim.id))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive((p) => (p === claim.id ? null : claim.id));
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Claim ${claim.index + 1}: ${claim.tier}, ${claim.totalSources} sources`}
                className="cursor-pointer outline-none"
              >
                <circle r={isActive ? 13 : 9} fill={color} opacity={isActive ? 0.22 : 0.12} />
                <circle r={isActive ? 7 : 5.5} fill={color} stroke="#0a0d14" strokeWidth="1.5" />
                <circle r={isActive ? 7 : 5.5} fill="url(#erm-glow)" />
                <text
                  x={9}
                  y={3.5}
                  fontFamily="ui-monospace, monospace"
                  fontSize="10"
                  fontWeight="600"
                  fill={isActive ? "#e9f6f8" : "#7aaab2"}
                >
                  #{claim.index + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {active ? <ActivePanel claims={claims} activeId={active} onClose={() => setActive(null)} /> : null}

      <details className="mt-3 text-[#a0a0a0]">
        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] text-[#666] hover:text-[#a0a0a0] sm:text-[11px]">
          All claims, sorted by risk
        </summary>
        <ul className="mt-2 space-y-1 text-xs">
          {[...claims]
            .sort((a, b) => tierToY(a.tier) - tierToY(b.tier) || a.totalSources - b.totalSources)
            .map((c) => (
              <li key={c.id} className="flex items-start gap-2">
                <span className="font-mono text-[#666]">#{c.index + 1}</span>
                <span className="font-mono text-[10px]" style={{ color: tierColor(c.tier) }}>
                  [{tierLabel(c.tier)}]
                </span>
                <span className="text-[#cfd8e0]">{c.claim}</span>
              </li>
            ))}
        </ul>
      </details>
    </section>
  );
}

function ActivePanel({ claims, activeId, onClose }: { claims: NormClaim[]; activeId: string; onClose: () => void }) {
  const c = claims.find((x) => x.id === activeId);
  if (!c) return null;
  return (
    <div className="panel mt-3 border-[#00e8ff]/30 bg-black/55 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] sm:text-[11px]" style={{ color: tierColor(c.tier) }}>
            Claim #{c.index + 1} · {tierLabel(c.tier)} · {c.totalSources} source{c.totalSources === 1 ? "" : "s"}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[#e0e0e0]">{c.claim}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded border border-[#00e8ff]/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#a0a0a0] hover:border-[#00e8ff]/60 hover:text-[#e0e0e0]"
        >
          Close
        </button>
      </div>
      {c.whatIsMissing ? (
        <p className="mt-2 text-xs text-[#a0a0a0]">
          <span className="font-mono text-[#666]">Risk surface: </span>
          {c.whatIsMissing}
        </p>
      ) : null}
    </div>
  );
}
