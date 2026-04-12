"use client";

import { useEffect, useRef } from "react";

export function PageViewTracker({ path, articleId }: { path: string; articleId?: number | null }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "PAGE_VIEW", path, articleId: articleId ?? undefined }),
    }).catch(() => {});
  }, [path, articleId]);

  return null;
}
