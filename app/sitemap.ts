import type { MetadataRoute } from "next";
import { listSitemapEntries } from "@/lib/article-public";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { categories, articles } = await listSitemapEntries();

  return [
    { url: `${base}/`, lastModified: new Date(), priority: 1.0 },
    { url: `${base}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/methodology`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/news`, lastModified: new Date(), priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), priority: 0.6 },
    { url: `${base}/editorial-standards`, lastModified: new Date(), priority: 0.6 },
    { url: `${base}/corrections`, lastModified: new Date(), priority: 0.6 },
    ...categories.map((category) => ({
      url: `${base}/news/${category.slug}`,
      lastModified: category.createdAt,
      priority: 0.6 as const,
    })),
    ...articles
      .filter((article) => article.topic?.category?.slug)
      .map((article) => ({
        url: `${base}/news/${article.topic!.category!.slug}/${article.slug}`,
        lastModified: article.updatedAt || article.publishedAt || article.createdAt,
        priority: 0.5 as const,
      })),
  ];
}
