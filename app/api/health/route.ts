import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedIngestKey, listIngestSecrets } from "@/lib/ingest-secrets";
import { getApiKeyFromRequest } from "@/lib/request-api-key";

export const runtime = "nodejs";

type HealthBase = {
  ok: true;
  service: "sypher-news-website";
  timestamp: string;
};

/**
 * Liveness for probes: always returns 200 when the app is running.
 * Handshake: send `Authorization: Bearer <token>` (or `X-Api-Key`) using the same secret as
 * `SYPHER_INGEST_TOKEN` or `ARTICLES_INGEST_API_KEY` (whichever is configured for ingest).
 */
export async function GET(req: Request) {
  const base: HealthBase = {
    ok: true,
    service: "sypher-news-website",
    timestamp: new Date().toISOString(),
  };

  const presented = getApiKeyFromRequest(req);
  if (!presented) {
    return NextResponse.json({
      ...base,
      handshake: "anonymous",
      hint: "Send Authorization: Bearer <SYPHER_INGEST_TOKEN or ARTICLES_INGEST_API_KEY> for verified handshake",
    });
  }

  const secrets = listIngestSecrets();
  if (secrets.length === 0) {
    return NextResponse.json(
      {
        error: {
          code: "auth_not_configured",
          message:
            "A bearer token was sent but neither SYPHER_INGEST_TOKEN nor ARTICLES_INGEST_API_KEY is set on this deployment",
        },
      },
      { status: 503 },
    );
  }

  if (!isAuthorizedIngestKey(presented)) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Invalid or missing API key" } },
      { status: 401 },
    );
  }

  let database: "ok" | "error" = "error";
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "ok";
  } catch {
    database = "error";
  }

  return NextResponse.json({
    ...base,
    handshake: "verified",
    database,
  });
}
