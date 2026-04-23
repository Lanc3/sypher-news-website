import { SLUG_TO_COUNTRY } from "@/lib/countries";

export const COUNTRY_CATEGORY_SLUGS = Array.from(SLUG_TO_COUNTRY.keys()).sort();

const countryCategorySlugSet = new Set(COUNTRY_CATEGORY_SLUGS);

export function isCountryCategorySlug(slug: string) {
  return countryCategorySlugSet.has(slug);
}
