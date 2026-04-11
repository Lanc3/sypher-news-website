import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimitAnalytics } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  path: z.string().min(1).max(2048).startsWith("/"),
  articleId: z.number().int().positive().optional(),
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

  const { path, articleId } = parsed.data;
  try {
    await prisma.pageView.create({
      data: {
        path,
        articleId: articleId ?? null,
      },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
