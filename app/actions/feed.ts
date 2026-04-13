"use server";

import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimitRegistration } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function registerClient(
  _prev: { error?: string; ok?: boolean },
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;
  const normalised = email.toLowerCase().trim();

  const rl = await rateLimitRegistration(normalised);
  if (!rl.ok) {
    return { error: "Too many attempts. Please try again later." };
  }

  const exists = await prisma.user.findUnique({ where: { email: normalised } });
  if (exists) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hash(password, 12);
  await prisma.user.create({
    data: {
      email: normalised,
      passwordHash,
      role: "CLIENT",
    },
  });

  return { ok: true };
}

export async function updateCategoryPreferences(categoryIds: number[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.$transaction([
    prisma.userCategoryPreference.deleteMany({ where: { userId: session.user.id } }),
    ...categoryIds.map((categoryId) =>
      prisma.userCategoryPreference.create({
        data: { userId: session.user.id, categoryId },
      }),
    ),
  ]);

  return { ok: true };
}

export async function getUserPreferences(): Promise<number[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const prefs = await prisma.userCategoryPreference.findMany({
    where: { userId: session.user.id },
    select: { categoryId: true },
  });
  return prefs.map((p) => p.categoryId);
}

export async function getFeedArticles(page = 1, pageSize = 20) {
  const session = await auth();
  if (!session?.user?.id) return { articles: [], total: 0 };

  const prefs = await prisma.userCategoryPreference.findMany({
    where: { userId: session.user.id },
    select: { categoryId: true },
  });

  if (prefs.length === 0) return { articles: [], total: 0 };
  const categoryIds = prefs.map((p) => p.categoryId);

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        topic: { categoryId: { in: categoryIds } },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        topic: { include: { category: true } },
      },
    }),
    prisma.article.count({
      where: {
        status: "PUBLISHED",
        topic: { categoryId: { in: categoryIds } },
      },
    }),
  ]);

  return { articles, total };
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true, description: true },
  });
}
