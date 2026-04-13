import type { ReactNode } from "react";

export default function FeedLayout({ children }: { children: ReactNode }) {
  // Auth check for protected feed routes is in app/feed/page.tsx (the main feed).
  // Login and register sub-routes are public.
  return <>{children}</>;
}
