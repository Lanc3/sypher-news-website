import { getCanonicalSiteUrl } from "@/lib/env";

export function siteUrl() {
  return getCanonicalSiteUrl().replace(/\/$/, "");
}
