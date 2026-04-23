import { prisma } from "@/lib/prisma";
import { updateHomepageFeaturedCategoriesAction } from "@/app/admin/admin-actions";
import { COUNTRY_CATEGORY_SLUGS } from "@/lib/category-utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminHomepageSettingsPage() {
  const [categories, featuredRows] = await Promise.all([
    prisma.category.findMany({
      where: { slug: { notIn: COUNTRY_CATEGORY_SLUGS } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, description: true },
    }),
    prisma.homepageCategoryFeature.findMany({
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: { categoryId: true },
    }),
  ]);

  const selectedIds = new Set(featuredRows.map((row) => row.categoryId));

  return (
    <div className="space-y-6 font-mono">
      <div>
        <h1 className="text-2xl text-[#00e8ff]">Homepage settings</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#888]">
          Select which non-country categories appear in the homepage Featured by category section.
        </p>
      </div>

      <form action={updateHomepageFeaturedCategoriesAction} className="space-y-5 rounded border border-[#00e8ff]/15 bg-black/40 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex min-h-20 cursor-pointer items-start gap-3 rounded border border-[#00e8ff]/10 bg-black/30 p-3 hover:border-[#00e8ff]/40"
            >
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                defaultChecked={selectedIds.has(category.id)}
                className="mt-1 h-4 w-4 rounded border-[#555] bg-black text-[#00e8ff] focus:ring-[#00e8ff]/50"
              />
              <span>
                <span className="block text-sm text-[#e0e0e0]">{category.name}</span>
                <span className="mt-1 block text-xs text-[#666]">/{category.slug}</span>
                {category.description ? <span className="mt-1 block text-xs text-[#888]">{category.description}</span> : null}
              </span>
            </label>
          ))}
        </div>

        {categories.length === 0 ? <p className="text-sm text-[#777]">No non-country categories are available.</p> : null}

        <div className="flex items-center justify-between gap-3 border-t border-[#00e8ff]/10 pt-4">
          <p className="text-xs text-[#777]">Leave all unchecked to hide the section until categories are selected.</p>
          <Button type="submit">Save homepage categories</Button>
        </div>
      </form>
    </div>
  );
}
