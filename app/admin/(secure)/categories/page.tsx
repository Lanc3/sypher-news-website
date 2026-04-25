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
      _count: { select: { topics: true } },
      topics: {
        select: { _count: { select: { articles: true } } },
      },
    },
  });

  return (
    <div className="space-y-5 font-mono">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#444]">Content</p>
        <h1 className="mt-1 text-xl font-semibold text-[#e0e0e0]">Categories</h1>
        <p className="mt-1 text-sm text-[#666]">
          Deleting a category removes all linked topics and articles.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#00e8ff]/15 bg-black/30 py-12 text-center">
          <p className="text-sm text-[#555]">No categories yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#00e8ff]/10 bg-black/40">
          <div className="hidden grid-cols-[1fr_80px_100px_auto] gap-4 border-b border-[#00e8ff]/10 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#3a3a4a] sm:grid">
            <span>Category</span>
            <span>Topics</span>
            <span>Articles</span>
            <span />
          </div>
          <ul className="divide-y divide-[#00e8ff]/5">
            {categories.map((category) => {
              const articleCount = category.topics.reduce(
                (sum, t) => sum + t._count.articles,
                0,
              );
              return (
                <li
                  key={category.id}
                  className="grid grid-cols-1 gap-2 px-5 py-4 transition hover:bg-white/2 sm:grid-cols-[1fr_80px_100px_auto] sm:items-center sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#bc13fe]">{category.name}</p>
                    <p className="mt-0.5 text-[11px] text-[#444]">/{category.slug}</p>
                  </div>
                  <p className="text-sm text-[#666]">{category._count.topics}</p>
                  <p className="text-sm text-[#666]">{articleCount}</p>
                  <form action={deleteCategoryFormAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <button
                      type="submit"
                      className="rounded border border-red-500/20 px-3 py-1.5 text-xs text-red-500/60 transition hover:border-red-500/50 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
