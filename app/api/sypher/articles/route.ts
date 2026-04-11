import { NextResponse } from "next/server";
import { rateLimitIngest } from "@/lib/rate-limit";
import { getApiKeyFromRequest } from "@/lib/request-api-key";
import { parseSypherBundle } from "@/lib/sypher-bundle-to-ingest";
import {
  persistArticleIngest,
  ReservedSlugError,
  SlugConflictError,
} from "@/lib/ingest-persist-article";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

/**
 * POST /api/sypher/articles
 *
 * Accepts Sypher-News remote sync bundle: `{ article, topic?, category? }`.
 * Auth: `Authorization: Bearer <token>` (or `X-Api-Key`) using `SYPHER_INGEST_TOKEN`
 * or, if unset, `ARTICLES_INGEST_API_KEY` (same secret as POST /api/v1/articles).
 *
 * Upserts by slug (updates existing article + sources).
 */
const MAX_BODY_BYTES = 2 * 1024 * 1024;

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { code, message, ...extra } }, { status });
}

function ingestSecret(): string | undefined {
  const a = process.env.SYPHER_INGEST_TOKEN?.trim();
  const b = process.env.ARTICLES_INGEST_API_KEY?.trim();
  return a || b;
}

export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}

export async function POST(req: Request) {
  const expected = ingestSecret();
  if (!expected) {
    return jsonError(503, "ingest_disabled", "Set SYPHER_INGEST_TOKEN or ARTICLES_INGEST_API_KEY");
  }

  const key = getApiKeyFromRequest(req);
  if (!key || key !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const rl = await rateLimitIngest(`ingest:${id}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many requests" } },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } },
    );
  }

  const len = Number(req.headers.get("content-length") || "0");
  if (len > MAX_BODY_BYTES) {
    return jsonError(413, "payload_too_large", "Request body too large");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseSypherBundle(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.message, ...(parsed.issues ? { issues: parsed.issues } : {}) },
      { status: 400 },
    );
  }

  try {
    const outcome = await persistArticleIngest(parsed.data, { upsert: true });
    return NextResponse.json(
      { ok: true, slug: parsed.data.slug, outcome },
      { status: outcome === "created" ? 201 : 200 },
    );
  } catch (e) {
    if (e instanceof ReservedSlugError) {
      return jsonError(422, "reserved_slug", "Slug is reserved");
    }
    if (e instanceof SlugConflictError) {
      return jsonError(409, "slug_conflict", "An article with this slug already exists");
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return jsonError(409, "slug_conflict", "An article with this slug already exists");
    }
    console.error("[sypher/articles]", e);
    return jsonError(500, "server_error", "Failed to persist article");
  }
}
