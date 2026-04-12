"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const shareTargets = [
  { label: "X", buildUrl: (url: string, title: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
  { label: "Facebook", buildUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { label: "LinkedIn", buildUrl: (url: string, title: string) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}` },
  { label: "Email", buildUrl: (url: string, title: string) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}` },
] as const;

async function trackShare(label: string, url: string) {
  try {
    await fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "SHARE", path: new URL(url).pathname, metadata: { target: label } }),
    });
  } catch {
    // Ignore analytics failures.
  }
}

export function ShareActions({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    void trackShare("copy", url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="panel border-[#00e8ff]/20 p-4">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00e8ff]/80">Share this analysis</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" onClick={copyLink} className="text-xs">
          {copied ? "Copied" : "Copy link"}
        </Button>
        {shareTargets.map((target) => (
          <Button key={target.label} asChild type="button" className="border-[#666]/40 text-xs text-[#d0d0d0] hover:text-[#00e8ff]">
            <a href={target.buildUrl(url, title)} target="_blank" rel="noreferrer" onClick={() => void trackShare(target.label, url)}>
              {target.label}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
