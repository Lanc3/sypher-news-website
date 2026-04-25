import iso from "./iso3166-numeric-to-alpha2.json";

/** ISO 3166-1 alpha-2 (lowercase) from numeric code (as in `CountryEntry.code`). */
export function isoNumericToAlpha2(numeric: string): string | undefined {
  return (iso as Record<string, string>)[numeric];
}
