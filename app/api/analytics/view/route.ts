import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimitAnalytics } from "@/lib/rate-limit";
import { recordAnalyticsEvent } from "@/lib/analytics";

export const runtime = "nodejs";

const bodySchema = z.object({
  type: z
    .enum(["PAGE_VIEW", "SHARE", "NEWSLETTER_SUBMIT", "AD_CLICK", "SEARCH", "RELATED_CLICK", "ADSENSE_RENDER", "ADSENSE_BLOCKED"])
    .default("PAGE_VIEW"),
  path: z.string().min(1).max(2048).startsWith("/").optional(),
  articleId: z.number().int().positive().optional(),
  placementId: z.string().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request) {
  const id = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const rl = await rateLimitAnalytics(`pv:${id}`);
  if (!rl.ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 422 });
  }

  const { type, path, articleId, placementId, metadata } = parsed.data;
  try {
    if (type === "PAGE_VIEW") {
      await prisma.pageView.create({
        data: {
          path: path || "/",
          articleId: articleId ?? null,
        },
      });
    }
    if (type === "AD_CLICK" && placementId) {
      await prisma.adClick.create({
        data: { placementId },
      });
    }
    await recordAnalyticsEvent({
      type,
      path: path ?? null,
      articleId: articleId ?? null,
      placementId: placementId ?? null,
      metadata: metadata ?? null,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
