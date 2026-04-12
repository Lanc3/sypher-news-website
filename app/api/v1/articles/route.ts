import { NextResponse } from "next/server";
import { articleIngestBodySchema } from "@/lib/ingest-schema";
import { isAuthorizedIngestKey, listIngestSecrets } from "@/lib/ingest-secrets";
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

const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_BODY_BYTES_BULK = 32 * 1024 * 1024;
const SYPHER_INGEST_BULK_FORMAT = "sypher_ingest_v1";

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { code, message, ...extra } }, { status });
}

export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}

export async function POST(req: Request) {
  const secrets = listIngestSecrets();
  if (secrets.length === 0) {
    return jsonError(503, "ingest_disabled", "Set SYPHER_INGEST_TOKEN or ARTICLES_INGEST_API_KEY");
  }
  const key = getApiKeyFromRequest(req);
  if (!isAuthorizedIngestKey(key)) {
    return jsonError(401, "unauthorized", "Invalid or missing API key");
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
  if (len > MAX_BODY_BYTES_BULK) {
    return jsonError(413, "payload_too_large", "Request body too large");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "invalid_json", "Malformed JSON body");
  }

  const isBulk =
    body !== null &&
    typeof body === "object" &&
    (body as { format?: unknown }).format === SYPHER_INGEST_BULK_FORMAT &&
    Array.isArray((body as { items?: unknown }).items);

  if (isBulk) {
    const items = (body as { items: unknown[] }).items;
    const slugs: string[] = [];
    const outcomes: { slug: string; outcome: "created" | "updated" }[] = [];

    try {
      for (let i = 0; i < items.length; i++) {
        const parsed = parseSypherBundle(items[i]);
        if (!parsed.ok) {
          return jsonError(400, "bulk_item_invalid", parsed.message, {
            index: i,
            ...(parsed.issues ? { issues: parsed.issues } : {}),
          });
        }
        const outcome = await persistArticleIngest(parsed.data, { upsert: true });
        slugs.push(parsed.data.slug);
        outcomes.push({ slug: parsed.data.slug, outcome });
      }
      return NextResponse.json({ ok: true, bulk: true, count: slugs.length, slugs, outcomes }, { status: 201 });
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
      console.error("[v1/articles bulk]", e);
      return jsonError(500, "server_error", "Failed to persist bulk articles");
    }
  }

  if (len > MAX_BODY_BYTES) {
    return jsonError(413, "payload_too_large", "Request body too large");
  }

  let allowUpsert = false;
  let parsed = articleIngestBodySchema.safeParse(body);
  if (!parsed.success) {
    const sypherParsed = parseSypherBundle(body);
    if (!sypherParsed.ok) {
      return jsonError(422, "validation_error", "Invalid payload", {
        issues: parsed.error.flatten(),
      });
    }
    allowUpsert = true;
    parsed = { success: true, data: sypherParsed.data };
  }

  try {
    const outcome = await persistArticleIngest(parsed.data, { upsert: allowUpsert });
    return NextResponse.json(
      { ok: true, bulk: false, slug: parsed.data.slug, outcome },
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
    console.error("[ingest]", e);
    return jsonError(500, "server_error", "Failed to persist article");
  }

}
