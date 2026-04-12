import type { MetadataRoute } from "next";
import { listSitemapEntries } from "@/lib/article-public";
import { siteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { categories, articles } = await listSitemapEntries();

  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/news`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
    { url: `${base}/editorial-standards`, lastModified: new Date() },
    { url: `${base}/corrections`, lastModified: new Date() },
    ...categories.map((category) => ({
      url: `${base}/news/${category.slug}`,
      lastModified: category.createdAt,
    })),
    ...articles
      .filter((article) => article.topic?.category?.slug)
      .map((article) => ({
        url: `${base}/news/${article.topic!.category!.slug}/${article.slug}`,
        lastModified: article.updatedAt || article.publishedAt || article.createdAt,
      })),
  ];
}
