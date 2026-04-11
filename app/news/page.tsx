import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const categoryListArgs = {
  orderBy: { name: "asc" as const },
  include: { _count: { select: { topics: true as const } } },
} satisfies Prisma.CategoryFindManyArgs;

type CategoryRow = Prisma.CategoryGetPayload<typeof categoryListArgs>;

export default async function NewsIndexPage() {
  let categories: CategoryRow[] = [];
  try {
    categories = await prisma.category.findMany(categoryListArgs);
  } catch {
    categories = [];
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 font-mono text-[#e0e0e0]">
      <h1 className="text-2xl text-[#00ff41]">/news</h1>
      <p className="mt-2 text-sm text-[#9a9a9a]">Browse categories. Articles live at /news/[category]/[slug].</p>
      <ul className="mt-8 space-y-3">
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/news/${c.slug}`} className="text-[#ff2bd6] hover:underline">
              {c.name}
            </Link>
            <span className="ml-2 text-xs text-[#555]">({c._count.topics} topics)</span>
          </li>
        ))}
      </ul>
      {categories.length === 0 ? <p className="mt-6 text-sm text-[#666]">No categories yet. Ingest or create from admin.</p> : null}
    </main>
  );
}
