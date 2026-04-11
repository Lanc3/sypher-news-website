/** Article slugs that would collide with first URL segment or common infra paths. */
export const RESERVED_ARTICLE_SLUGS = new Set([
  "admin",
  "api",
  "news",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export function isReservedArticleSlug(slug: string): boolean {
  return RESERVED_ARTICLE_SLUGS.has(slug.toLowerCase());
}
