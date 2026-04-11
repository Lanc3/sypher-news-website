"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const emailSchema = z.string().email().max(320);

export async function subscribeNewsletter(rawEmail: string): Promise<{ ok: boolean; message: string }> {
  const parsed = emailSchema.safeParse(rawEmail.trim().toLowerCase());
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email address." };
  }
  const email = parsed.data;
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, consentAt: new Date() },
      update: { consentAt: new Date() },
    });
    return { ok: true, message: "You are on the list. Welcome to the signal." };
  } catch {
    return { ok: false, message: "Could not save subscription. Try again later." };
  }
}
