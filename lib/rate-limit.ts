import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getEnv } from "@/lib/env";

const upstash = (() => {
  const env = getEnv();
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
})();

const ingestLimiter = upstash
  ? new Ratelimit({
      redis: upstash,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "sypher:ingest",
    })
  : null;

const analyticsLimiter = upstash
  ? new Ratelimit({
      redis: upstash,
      limiter: Ratelimit.slidingWindow(120, "1 m"),
      prefix: "sypher:analytics",
    })
  : null;

export async function rateLimitIngest(identifier: string): Promise<{ ok: boolean; retryAfterSec?: number }> {
  if (!ingestLimiter) return { ok: true };
  const { success, reset } = await ingestLimiter.limit(identifier);
  if (success) return { ok: true };
  const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return { ok: false, retryAfterSec };
}

export async function rateLimitAnalytics(identifier: string): Promise<{ ok: boolean }> {
  if (!analyticsLimiter) return { ok: true };
  const { success } = await analyticsLimiter.limit(identifier);
  return { ok: success };
}
