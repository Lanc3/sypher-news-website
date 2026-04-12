import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  AUTH_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  ARTICLES_INGEST_API_KEY: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional().or(z.literal("")),
  NEXT_PUBLIC_ADSENSE_CLIENT: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_AUDIENCE_ID: z.string().min(1).optional(),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

export function getCanonicalSiteUrl() {
  const env = getEnv();
  return env.NEXT_PUBLIC_SITE_URL || env.AUTH_URL || env.NEXTAUTH_URL || "http://localhost:3000";
}

export function assertRuntimeEnv() {
  const env = getEnv();
  const required = [
    !env.DATABASE_URL && "DATABASE_URL",
    !(env.AUTH_SECRET || env.NEXTAUTH_SECRET) && "AUTH_SECRET",
  ].filter(Boolean);

  if (env.NODE_ENV === "production" && required.length > 0) {
    throw new Error(`Missing required environment variables: ${required.join(", ")}`);
  }

  return env;
}

export function hasUpstashConfig() {
  const env = getEnv();
  return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

export function hasResendAudienceConfig() {
  const env = getEnv();
  return Boolean(env.RESEND_API_KEY && env.RESEND_AUDIENCE_ID);
}
