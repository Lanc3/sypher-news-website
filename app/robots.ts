import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/news", "/search", "/about", "/contact", "/editorial-standards", "/corrections"],
      disallow: ["/admin"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
