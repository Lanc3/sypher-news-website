import type { ReactNode } from "react";

/** Remounts on client navigations; keep opacity delta tiny to avoid double-busy with loading.tsx */
export default function RouteTemplate({ children }: { children: ReactNode }) {
  return <div className="route-content-enter min-h-0 flex-1">{children}</div>;
}
