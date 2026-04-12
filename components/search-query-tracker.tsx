"use client";

import { useEffect, useRef } from "react";

export function SearchQueryTracker({ query }: { query: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (!query || sent.current) return;
    sent.current = true;
    void fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "SEARCH", path: "/search", metadata: { query } }),
    }).catch(() => {});
  }, [query]);

  return null;
}
