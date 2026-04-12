"use client";

import { useState } from "react";
import { useAdConsent } from "@/components/ad-provider";

export function ConsentBanner() {
  const { status, setStatus } = useAdConsent();
  const [dismissed, setDismissed] = useState(false);

  function choose(next: "accepted" | "rejected") {
    setDismissed(true);
    setStatus(next);
  }

  if (dismissed || status !== "unknown") return null;

  return (
    <div className="pointer-events-auto fixed bottom-4 left-1/2 z-[90] w-[min(92vw,48rem)] -translate-x-1/2 rounded-lg border border-[#00e8ff]/25 bg-[#05080f]/95 p-4 shadow-[0_0_20px_rgba(0,0,0,0.45)]">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00e8ff]/75">Privacy and ads</p>
      <p className="mt-2 text-sm leading-relaxed text-[#b0b0b0]">
        Sypher News uses analytics and Google AdSense to understand readership and support the newsroom. Choose whether to allow ad-related tracking on this device.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded border border-[#00e8ff]/40 bg-[#0a1118] px-4 py-2.5 text-xs font-medium text-[#00e8ff] transition hover:border-[#00e8ff] hover:shadow-[0_0_20px_rgba(0,232,255,0.25)]"
        >
          Allow ads
        </button>
        <button
          type="button"
          onClick={() => choose("rejected")}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded border border-[#666]/40 bg-[#0a1118] px-4 py-2.5 text-xs font-medium text-[#d0d0d0] transition hover:border-[#00e8ff]/40 hover:text-[#00e8ff]"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
