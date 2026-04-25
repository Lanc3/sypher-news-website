import { prisma } from "@/lib/prisma";
import { deleteCategoryFormAction } from "@/app/admin/admin-actions";
import { COUNTRY_CATEGORY_SLUGS } from "@/lib/category-utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: {
      slug: { notIn: COUNTRY_CATEGORY_SLUGS },
    },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          topics: true,
        },
      },
      topics: {
        select: {
          _count: {
            select: {
              articles: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6 font-mono">
      <div>
        <h1 className="text-2xl text-[#00e8ff]">Categories</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#888]">
          Delete categories and automatically remove all linked topics and articles in one action.
        </p>
      </div>

      <ul className="space-y-3">
        {categories.map((category) => {
          const articleCount = category.topics.reduce((sum, topic) => sum + topic._count.articles, 0);
          return (
            <li key={category.id} className="flex flex-col gap-3 rounded border border-[#00e8ff]/15 bg-black/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[#bc13fe]">{category.name}</p>
                <p className="mt-1 text-xs text-[#666]">/{category.slug}</p>
                <p className="mt-1 text-xs text-[#888]">
                  {category._count.topics} topics · {articleCount} articles
                </p>
              </div>

              <form action={deleteCategoryFormAction}>
                <input type="hidden" name="id" value={category.id} />
                <Button type="submit" className="border-red-500/40 text-xs text-red-400 hover:shadow-red-500/20">
                  Delete category
                </Button>
              </form>
            </li>
          );
        })}
      </ul>

      {categories.length === 0 ? <p className="text-sm text-[#666]">No categories yet.</p> : null}
    </div>
  );
}
