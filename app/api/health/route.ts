import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiKeyFromRequest } from "@/lib/request-api-key";

export const runtime = "nodejs";

type HealthBase = {
  ok: true;
  service: "sypher-news-website";
  timestamp: string;
};

/**
 * Liveness for probes: always returns 200 when the app is running.
 * Handshake: send `Authorization: Bearer <ARTICLES_INGEST_API_KEY>` (or `X-Api-Key`)
 * to verify the shared secret and database connectivity.
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
      hint: "Send Authorization: Bearer <ARTICLES_INGEST_API_KEY> for verified handshake",
    });
  }

  const expected = process.env.ARTICLES_INGEST_API_KEY;
  if (!expected) {
    return NextResponse.json(
      {
        error: {
          code: "auth_not_configured",
          message: "A bearer token was sent but ARTICLES_INGEST_API_KEY is not set on this deployment",
        },
      },
      { status: 503 },
    );
  }

  if (presented !== expected) {
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
