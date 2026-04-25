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
    <div className="space-y-5 font-mono">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#444]">Content</p>
        <h1 className="mt-1 text-xl font-semibold text-[#e0e0e0]">Homepage settings</h1>
        <p className="mt-1 text-sm text-[#666]">
          Choose which categories appear in the homepage channel highlights section.
        </p>
      </div>

      <form action={updateHomepageFeaturedCategoriesAction} className="space-y-5">
        {categories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#00e8ff]/15 bg-black/30 py-12 text-center">
            <p className="text-sm text-[#555]">No non-country categories available.</p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const checked = selectedIds.has(category.id);
              return (
                <label
                  key={category.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                    checked
                      ? "border-[#00e8ff]/40 bg-[#00e8ff]/5"
                      : "border-[#00e8ff]/10 bg-black/40 hover:border-[#00e8ff]/25"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={category.id}
                    defaultChecked={checked}
                    className="mt-1 size-4 rounded border-[#444] bg-black accent-[#00e8ff]"
                  />
                  <span className="min-w-0">
                    <span className={`block text-sm font-medium ${checked ? "text-[#00e8ff]" : "text-[#d0d0d0]"}`}>
                      {category.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[#444]">/{category.slug}</span>
                    {category.description ? (
                      <span className="mt-1 block text-xs leading-relaxed text-[#666]">
                        {category.description}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 rounded-lg border border-[#00e8ff]/10 bg-black/40 px-5 py-4">
          <p className="text-xs text-[#555]">
            Leave all unchecked to hide the section until categories are selected.
          </p>
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </div>
  );
}
