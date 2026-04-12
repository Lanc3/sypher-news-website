"use client";

import Script from "next/script";
import { useAdConsent, useAdPlacements } from "@/components/ad-provider";

export function AdsenseScript() {
  const placements = useAdPlacements();
  const { status } = useAdConsent();
  const activePlacement = placements.find((placement) => placement.enabled && placement.adClient);

  if (status !== "accepted" || !activePlacement?.adClient) return null;

  return (
    <Script
      id="adsense-script"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${activePlacement.adClient}`}
      crossOrigin="anonymous"
    />
  );
}
