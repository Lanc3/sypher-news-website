"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AdPlacement } from "@prisma/client";
import { AdsenseSlot } from "@/components/adsense-slot";

const AdContext = createContext<AdPlacement[]>([]);
const ConsentContext = createContext<{
  status: "unknown" | "accepted" | "rejected";
  setStatus: (status: "accepted" | "rejected") => void;
}>({
  status: "unknown",
  setStatus: () => undefined,
});

const CONSENT_KEY = "sypher_ads_consent";

export function AdProviderClient({ placements, children }: { placements: AdPlacement[]; children: ReactNode }) {
  const [status, setStatusState] = useState<"unknown" | "accepted" | "rejected">(() => {
    if (typeof window === "undefined") return "unknown";
    const saved = window.localStorage.getItem(CONSENT_KEY);
    return saved === "accepted" || saved === "rejected" ? saved : "unknown";
  });

  useEffect(() => {
    function syncFromStorage() {
      const saved = window.localStorage.getItem(CONSENT_KEY);
      setStatusState(saved === "accepted" || saved === "rejected" ? saved : "unknown");
    }

    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  const setStatus = useCallback((next: "accepted" | "rejected") => {
    setStatusState(next);
    try {
      window.localStorage.setItem(CONSENT_KEY, next);
    } catch {
      // Keep the UI responsive even if storage is unavailable.
    }
  }, []);

  const consent = useMemo(
    () => ({
      status,
      setStatus,
    }),
    [setStatus, status],
  );

  return (
    <ConsentContext.Provider value={consent}>
      <AdContext.Provider value={placements}>{children}</AdContext.Provider>
    </ConsentContext.Provider>
  );
}

export function useAdPlacements() {
  return useContext(AdContext);
}

export function useAdConsent() {
  return useContext(ConsentContext);
}

export function HeaderAdSlot() {
  const p = useAdPlacements().find((x) => x.slot === "header" && x.enabled);
  if (!p) return <div className="h-[50px] w-full" aria-hidden />;
  return <AdsenseSlot placement={p} className="min-h-[50px] w-full border-b border-[#00e8ff]/20 bg-black/40" />;
}

export function SidebarAdSlot() {
  const p = useAdPlacements().find((x) => x.slot === "sidebar" && x.enabled);
  if (!p) return null;
  return (
    <aside className="w-full shrink-0 border-t border-[#00e8ff]/15 bg-black/30 p-3 sm:p-4 lg:mt-0 lg:w-[280px] lg:border-l lg:border-t-0">
      <AdsenseSlot
        placement={p}
        className="min-h-[100px] border border-dashed border-[#00e8ff]/25 p-3 sm:min-h-[140px] lg:min-h-[600px] lg:p-4"
      />
    </aside>
  );
}

export function InArticleAdSlot() {
  const p = useAdPlacements().find((x) => x.slot === "in_article" && x.enabled);
  if (!p) return null;
  return <AdsenseSlot placement={p} className="my-8 min-h-[100px] border border-[#00e8ff]/20 bg-black/40 p-4 sm:min-h-[120px]" />;
}
