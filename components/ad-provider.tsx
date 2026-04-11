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
    <div className="flex h-[50px] w-full items-center justify-center border-b border-[#00ff41]/20 bg-black/40 text-xs text-[#666]">
      <span className="font-mono text-[#00ff41]/70">[ AD_SLOT header ]</span>
      {p.adUnitPath ? <span className="ml-2 truncate text-[10px] text-[#888]">{p.adUnitPath}</span> : null}
    </div>
  );
}

export function SidebarAdSlot() {
  const p = useAdPlacements().find((x) => x.slot === "sidebar" && x.enabled);
  if (!p) return null;
  return (
    <aside className="hidden w-[280px] shrink-0 border-l border-[#00ff41]/15 bg-black/30 p-3 lg:block">
      <div className="flex min-h-[600px] flex-col items-center justify-start border border-dashed border-[#00ff41]/25 p-2 text-center text-xs text-[#666]">
        <span className="font-mono text-[#00ff41]/70">[ AD_SLOT sidebar ]</span>
        {p.adUnitPath ? <span className="mt-2 break-all text-[10px] text-[#888]">{p.adUnitPath}</span> : null}
      </div>
    </aside>
  );
}

export function InArticleAdSlot() {
  const p = useAdPlacements().find((x) => x.slot === "in_article" && x.enabled);
  if (!p) return null;
  return (
    <div className="my-8 flex min-h-[120px] items-center justify-center border border-[#00ff41]/20 bg-black/40 p-4 text-xs text-[#666]">
      <span className="font-mono text-[#00ff41]/70">[ AD_SLOT in_article ]</span>
      {p.adUnitPath ? <span className="ml-2 truncate text-[10px] text-[#888]">{p.adUnitPath}</span> : null}
    </div>
  );
}
