"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AdPlacement } from "@prisma/client";

const AdContext = createContext<AdPlacement[]>([]);

export function AdProviderClient({ placements, children }: { placements: AdPlacement[]; children: ReactNode }) {
  return <AdContext.Provider value={placements}>{children}</AdContext.Provider>;
}

export function useAdPlacements() {
  return useContext(AdContext);
}

export function HeaderAdSlot() {
  const p = useAdPlacements().find((x) => x.slot === "header" && x.enabled);
  if (!p) return <div className="h-[50px] w-full" aria-hidden />;
  return (
    <div className="flex min-h-[50px] w-full items-center justify-center gap-2 border-b border-[#00ff41]/20 bg-black/40 px-3 py-2 text-xs text-[#666]">
      <span className="shrink-0 font-mono text-[#00ff41]/70">[ AD_SLOT header ]</span>
      {p.adUnitPath ? <span className="truncate text-center text-[10px] text-[#888] sm:text-xs">{p.adUnitPath}</span> : null}
    </div>
  );
}

export function SidebarAdSlot() {
  const p = useAdPlacements().find((x) => x.slot === "sidebar" && x.enabled);
  if (!p) return null;
  return (
    <aside className="w-full shrink-0 border-t border-[#00ff41]/15 bg-black/30 p-3 sm:p-4 lg:mt-0 lg:w-[280px] lg:border-l lg:border-t-0">
      <div className="flex min-h-[100px] flex-col items-center justify-center gap-2 border border-dashed border-[#00ff41]/25 p-3 text-center text-xs text-[#666] sm:min-h-[140px] lg:min-h-[600px] lg:items-start lg:justify-start lg:p-4">
        <span className="font-mono text-[#00ff41]/70">[ AD_SLOT sidebar ]</span>
        {p.adUnitPath ? (
          <span className="max-w-full break-all text-left text-[10px] leading-relaxed text-[#888] sm:text-xs">{p.adUnitPath}</span>
        ) : null}
      </div>
    </aside>
  );
}

export function InArticleAdSlot() {
  const p = useAdPlacements().find((x) => x.slot === "in_article" && x.enabled);
  if (!p) return null;
  return (
    <div className="my-8 flex min-h-[100px] flex-col items-center justify-center gap-2 border border-[#00ff41]/20 bg-black/40 p-4 text-xs text-[#666] sm:min-h-[120px] sm:flex-row">
      <span className="shrink-0 font-mono text-[#00ff41]/70">[ AD_SLOT in_article ]</span>
      {p.adUnitPath ? <span className="max-w-full truncate text-center text-[10px] text-[#888] sm:text-xs">{p.adUnitPath}</span> : null}
    </div>
  );
}
