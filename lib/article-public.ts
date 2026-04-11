import { prisma } from "@/lib/prisma";

export const articlePublicInclude = {
  topic: { include: { category: true } },
  sources: { orderBy: { id: "asc" as const } },
  authorStyle: true,
} as const;

export async function getArticleBySlug(slug: string) {
  try {
    return await prisma.article.findUnique({
      where: { slug },
      include: articlePublicInclude,
    });
  } catch {
    return null;
  }
}

export async function listRecentArticles(take = 48) {
  try {
    return await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: articlePublicInclude,
    });
  } catch {
    return [];
  }
}

export async function listCategorySlugs() {
  try {
    const rows = await prisma.category.findMany({ select: { slug: true } });
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}
