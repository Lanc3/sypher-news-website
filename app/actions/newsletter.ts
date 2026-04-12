"use server";

import { prisma } from "@/lib/prisma";
import { recordAnalyticsEvent } from "@/lib/analytics";
import { syncNewsletterSubscribe, syncNewsletterUnsubscribe } from "@/lib/email-provider";
import { z } from "zod";

const emailSchema = z.string().email().max(320);
const sourceSchema = z.enum(["footer", "popup", "page"]).default("footer");

export async function subscribeNewsletter(
  rawEmail: string,
  source: "footer" | "popup" | "page" = "footer",
): Promise<{ ok: boolean; message: string }> {
  const parsed = emailSchema.safeParse(rawEmail.trim().toLowerCase());
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email address." };
  }
  const validSource = sourceSchema.parse(source);
  const email = parsed.data;
  try {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    const provider = await syncNewsletterSubscribe(email);
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        consentAt: new Date(),
        lastConfirmedAt: new Date(),
        source: validSource,
        status: "ACTIVE",
        providerId: provider.providerId ?? null,
        providerStatus: provider.providerStatus ?? "subscribed",
      },
      update: {
        consentAt: new Date(),
        lastConfirmedAt: new Date(),
        unsubscribedAt: null,
        source: validSource,
        status: "ACTIVE",
        providerId: provider.providerId ?? existing?.providerId ?? null,
        providerStatus: provider.providerStatus ?? "subscribed",
      },
    });
    await recordAnalyticsEvent({
      type: "NEWSLETTER_SUBMIT",
      path: validSource === "popup" ? "/newsletter/popup" : "/newsletter/footer",
      metadata: { emailDomain: email.split("@")[1], source: validSource },
    });
    return { ok: true, message: "You are on the list. Welcome to the signal." };
  } catch {
    return { ok: false, message: "Could not save subscription. Try again later." };
  }
}

export async function unsubscribeNewsletter(token: string): Promise<{ ok: boolean; message: string }> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return { ok: false, message: "Missing unsubscribe token." };
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: cleanToken },
    });
    if (!subscriber) {
      return { ok: false, message: "This unsubscribe link is invalid or expired." };
    }

    const provider = await syncNewsletterUnsubscribe(subscriber.email, subscriber.providerId);
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date(),
        providerStatus: provider.providerStatus ?? "unsubscribed",
      },
    });

    return { ok: true, message: "You have been unsubscribed from the Sypher dispatch." };
  } catch {
    return { ok: false, message: "Could not complete unsubscribe. Try again later." };
  }
}
