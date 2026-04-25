import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteContainer } from "@/components/site-container";
import { NewsCategoryFeed } from "@/components/news-category-feed";
import { COUNTRY_CATEGORY_SLUGS } from "@/lib/category-utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "News channels",
  description: "Browse Sypher News channels and jump into category-based reporting.",
};

const categoryListArgs = {
  where: { slug: { notIn: COUNTRY_CATEGORY_SLUGS } },
  orderBy: { name: "asc" as const },
  include: { _count: { select: { topics: true as const } } },
} satisfies Prisma.CategoryFindManyArgs;

type CategoryRow = Prisma.CategoryGetPayload<typeof categoryListArgs>;

export default async function NewsIndexPage() {
  const session = await auth();
  let categories: CategoryRow[] = [];
  try {
    categories = await prisma.category.findMany(categoryListArgs);
  } catch {
    categories = [];
  }

  return (
    <main id="main-content" className="flex-1 py-10 sm:py-14">
      <SiteContainer max="xl">
        <NewsCategoryFeed
          categories={categories.map((category) => ({
            id: category.id,
            slug: category.slug,
            name: category.name,
            description: category.description,
            topicCount: category._count.topics,
          }))}
          hasSignedInUser={Boolean(session?.user)}
        />
      </SiteContainer>
    </main>
  );
}
