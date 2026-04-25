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
  const userId = await requireUserId();

  await prisma.$transaction([
    prisma.userCategoryPreference.deleteMany({ where: { userId } }),
    ...categoryIds.map((categoryId) =>
      prisma.userCategoryPreference.create({
        data: { userId, categoryId },
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

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getSavedArticleIds(): Promise<number[]> {
  const userId = await requireUserId();
  const saved = await prisma.savedArticle.findMany({
    where: { userId },
    select: { articleId: true },
  });
  return saved.map((item) => item.articleId);
}

export async function isArticleSaved(articleId: number): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const saved = await prisma.savedArticle.findUnique({
    where: { userId_articleId: { userId: session.user.id, articleId } },
    select: { id: true },
  });
  return Boolean(saved);
}

export async function getSavedArticles(page = 1, pageSize = 30) {
  const userId = await requireUserId();

  const [savedRows, total] = await Promise.all([
    prisma.savedArticle.findMany({
      where: { userId, article: { status: "PUBLISHED" } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        article: {
          include: {
            topic: { include: { category: true } },
          },
        },
      },
    }),
    prisma.savedArticle.count({
      where: { userId, article: { status: "PUBLISHED" } },
    }),
  ]);

  return {
    articles: savedRows.map((row) => ({
      ...row.article,
      savedAt: row.createdAt,
    })),
    total,
  };
}

export async function saveArticleForLater(articleId: number) {
  const userId = await requireUserId();

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, status: true },
  });
  if (!article || article.status !== "PUBLISHED") {
    throw new Error("Article not available");
  }

  await prisma.savedArticle.upsert({
    where: { userId_articleId: { userId, articleId } },
    update: {},
    create: { userId, articleId },
  });

  return { ok: true };
}

export async function removeSavedArticle(articleId: number) {
  const userId = await requireUserId();

  await prisma.savedArticle.deleteMany({
    where: { userId, articleId },
  });

  return { ok: true };
}
