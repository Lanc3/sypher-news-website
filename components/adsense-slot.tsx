"use client";

import { useEffect, useMemo, useRef } from "react";
import type { AdPlacement } from "@prisma/client";
import { useAdConsent } from "@/components/ad-provider";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

async function track(type: string, payload: Record<string, unknown>) {
  try {
    await fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ...payload }),
    });
  } catch {
    // Ignore analytics failures.
  }
}

export function AdsenseSlot({ placement, className }: { placement: AdPlacement; className?: string }) {
  const { status } = useAdConsent();
  const pushed = useRef(false);
  const configured = Boolean(placement.adClient && placement.slotId);

  const fallbackMessage = useMemo(() => {
    if (status === "rejected") return "Ads are disabled until consent is granted.";
    if (!configured) return "Ad slot configured in admin but missing AdSense client or slot ID.";
    return "Ad loading.";
  }, [configured, status]);

  useEffect(() => {
    if (!placement.enabled) return;
    if (!configured || status !== "accepted") {
      void track("ADSENSE_BLOCKED", {
        placementId: placement.id,
        path: placement.targetPath || undefined,
        metadata: { consent: status, configured },
      });
      return;
    }
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
      void track("ADSENSE_RENDER", {
        placementId: placement.id,
        path: placement.targetPath || undefined,
        metadata: { slot: placement.slot, format: placement.format || "auto" },
      });
    } catch {
      // AdSense sometimes throws if the slot was already requested.
    }
  }, [configured, placement.enabled, placement.format, placement.id, placement.slot, placement.targetPath, status]);

  if (!placement.enabled) return null;

  if (status !== "accepted" || !configured) {
    return (
      <div className={`flex items-center justify-center text-center text-xs text-[#666] ${className || ""}`}>
        <div>
          <p className="font-mono text-[#00e8ff]/70">[ AD_SLOT {placement.slot} ]</p>
          <p className="mt-2 max-w-md text-[11px] leading-relaxed text-[#888]">{fallbackMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client={placement.adClient || undefined}
        data-ad-slot={placement.slotId || undefined}
        data-ad-format={placement.format || "auto"}
        data-full-width-responsive="true"
        data-ad-layout-key={placement.layoutKey || undefined}
      />
    </div>
  );
}
