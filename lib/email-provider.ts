import { hasResendAudienceConfig } from "@/lib/env";

type EmailProviderResult = {
  ok: boolean;
  providerId?: string | null;
  providerStatus?: string;
};

const RESEND_BASE_URL = "https://api.resend.com";

async function resendRequest(path: string, init: RequestInit) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is missing");

  const res = await fetch(`${RESEND_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend request failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<Record<string, unknown>>;
}

export async function syncNewsletterSubscribe(email: string): Promise<EmailProviderResult> {
  if (!hasResendAudienceConfig()) {
    return { ok: true, providerStatus: "local_only" };
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID!;
  const payload = await resendRequest(`/audiences/${audienceId}/contacts`, {
    method: "POST",
    body: JSON.stringify({ email, unsubscribed: false }),
  });

  return {
    ok: true,
    providerId: typeof payload.id === "string" ? payload.id : null,
    providerStatus: "subscribed",
  };
}

export async function syncNewsletterUnsubscribe(email: string, providerId?: string | null): Promise<EmailProviderResult> {
  if (!hasResendAudienceConfig()) {
    return { ok: true, providerStatus: "local_only" };
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID!;

  if (providerId) {
    await resendRequest(`/audiences/${audienceId}/contacts/${providerId}`, {
      method: "PATCH",
      body: JSON.stringify({ unsubscribed: true }),
    });
    return { ok: true, providerId, providerStatus: "unsubscribed" };
  }

  try {
    await resendRequest(`/audiences/${audienceId}/contacts`, {
      method: "POST",
      body: JSON.stringify({ email, unsubscribed: true }),
    });
    return { ok: true, providerStatus: "unsubscribed" };
  } catch {
    return { ok: true, providerStatus: "unsubscribe_pending" };
  }
}
