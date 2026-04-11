/**
 * Shared secret for machine-to-machine routes (ingest, health handshake).
 * Send either `Authorization: Bearer <key>` or `X-Api-Key: <key>`.
 */
export function getApiKeyFromRequest(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim() || null;
  }
  const alt = req.headers.get("x-api-key");
  return alt?.trim() || null;
}
