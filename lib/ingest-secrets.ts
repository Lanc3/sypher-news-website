/**
 * Machine ingest auth: POST /api/sypher/articles and verified GET /api/health
 * accept any of these secrets (Bearer or X-Api-Key).
 */
export function listIngestSecrets(): string[] {
  const a = process.env.SYPHER_INGEST_TOKEN?.trim();
  const b = process.env.ARTICLES_INGEST_API_KEY?.trim();
  const out: string[] = [];
  if (a) out.push(a);
  if (b) out.push(b);
  return [...new Set(out)];
}

export function isAuthorizedIngestKey(key: string | null | undefined): boolean {
  if (!key) return false;
  return listIngestSecrets().includes(key);
}
