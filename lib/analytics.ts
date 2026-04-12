import { Prisma } from "@prisma/client";
import type { AnalyticsEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Payload = {
  type: AnalyticsEventType;
  path?: string | null;
  articleId?: number | null;
  placementId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function recordAnalyticsEvent(payload: Payload) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        type: payload.type,
        path: payload.path ?? null,
        articleId: payload.articleId ?? null,
        placementId: payload.placementId ?? null,
        metadata: (payload.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Analytics should never break the reader flow.
  }
}
