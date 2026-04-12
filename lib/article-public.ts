import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const articlePublicInclude = {
  topic: { include: { category: true } },
  sources: { orderBy: { id: "asc" as const } },
  authorStyle: true,
  authorLinks: {
    orderBy: { position: "asc" as const },
    include: { author: true },
  },
  corrections: {
    orderBy: { createdAt: "desc" as const },
  },
  revisions: {
    orderBy: { createdAt: "desc" as const },
    take: 5,
  },
} as const satisfies Prisma.ArticleInclude;

const publicOrderBy = [{ publishedAt: "desc" as const }, { createdAt: "desc" as const }];

export type PublicArticle = Prisma.ArticleGetPayload<{ include: typeof articlePublicInclude }>;

export async function getArticleBySlug(slug: string) {
  try {
    return await prisma.article.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: articlePublicInclude,
    });
  } catch {
    return null;
  }
}

export async function listRecentArticles(take = 48) {
  try {
    return await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: publicOrderBy,
      take,
      include: articlePublicInclude,
    });
  } catch {
    return [];
  }
}

export async function listFeaturedArticles(take = 6) {
  try {
    return await prisma.article.findMany({
      where: { status: "PUBLISHED", featured: true },
      orderBy: publicOrderBy,
      take,
      include: articlePublicInclude,
    });
  } catch {
    return [];
  }
}

export async function listArticlesByCategorySlug(categorySlug: string, take = 100) {
  try {
    return await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        topic: { category: { slug: categorySlug } },
      },
      orderBy: publicOrderBy,
      take,
      include: articlePublicInclude,
    });
  } catch {
    return [];
  }
}

export async function listRelatedArticles(articleId: number, categoryId: number, take = 4) {
  try {
    return await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: articleId },
        topic: { categoryId },
      },
      orderBy: publicOrderBy,
      take,
      include: articlePublicInclude,
    });
  } catch {
    return [];
  }
}

export async function listHomepageSections() {
  try {
    const [featured, latest, categories] = await Promise.all([
      listFeaturedArticles(4),
      listRecentArticles(18),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          topics: {
            include: {
              articles: {
                where: { status: "PUBLISHED" },
                orderBy: publicOrderBy,
                take: 3,
                include: articlePublicInclude,
              },
            },
            take: 3,
          },
        },
      }),
    ]);

    return {
      featured,
      latest,
      categoryGroups: categories
        .map((category) => ({
          category,
          articles: category.topics.flatMap((topic) => topic.articles).slice(0, 3),
        }))
        .filter((group) => group.articles.length > 0)
        .slice(0, 4),
    };
  } catch {
    return { featured: [], latest: [], categoryGroups: [] };
  }
}

export async function searchPublicArticles(query: string, take = 24) {
  const term = query.trim();
  if (!term) return [];
  try {
    return await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { summary: { contains: term, mode: "insensitive" } },
          { bodyMarkdown: { contains: term, mode: "insensitive" } },
          { topic: { title: { contains: term, mode: "insensitive" } } },
          { topic: { category: { name: { contains: term, mode: "insensitive" } } } },
        ],
      },
      orderBy: publicOrderBy,
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

export async function listSitemapEntries() {
  try {
    const [categories, articles] = await Promise.all([
      prisma.category.findMany({ select: { slug: true, createdAt: true } }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        select: {
          slug: true,
          updatedAt: true,
          publishedAt: true,
          createdAt: true,
          topic: { select: { category: { select: { slug: true } } } },
        },
        orderBy: publicOrderBy,
        take: 500,
      }),
    ]);

    return { categories, articles };
  } catch {
    return { categories: [], articles: [] };
  }
}

export async function getAuthorArchive(slug: string) {
  try {
    const author = await prisma.author.findUnique({
      where: { slug },
      include: {
        articleLinks: {
          orderBy: { position: "asc" },
          include: {
            article: {
              include: articlePublicInclude,
            },
          },
        },
      },
    });
    if (!author) return null;
    return {
      ...author,
      articles: author.articleLinks
        .map((link) => link.article)
        .filter((article) => article.status === "PUBLISHED")
        .sort((a, b) => (b.publishedAt || b.createdAt).getTime() - (a.publishedAt || a.createdAt).getTime()),
    };
  } catch {
    return null;
  }
}
