import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SiteContainer } from "@/components/site-container";

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
    <main className="flex-1 py-10 sm:py-14">
      <SiteContainer max="md">
        <header className="panel px-5 py-6 sm:px-8 sm:py-8">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-[#bc13fe] sm:text-xs">Index</p>
          <h1 className="mt-2 font-mono text-2xl font-bold tracking-tight text-[#00e8ff] sm:text-3xl">/news</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#9a9a9a] sm:text-base">
            Browse channels. Articles resolve at{" "}
            <code className="rounded border border-[#00e8ff]/25 bg-black/50 px-1.5 py-0.5 text-xs text-[#00e8ff]/90">
              /news/[category]/[slug]
            </code>
            .
          </p>
        </header>

        <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/news/${c.slug}`}
                className="panel panel-glow flex min-h-[4.5rem] flex-col justify-center px-4 py-4 sm:min-h-0 sm:px-5 sm:py-5"
              >
                <span className="font-mono text-base font-semibold text-[#bc13fe] sm:text-lg">{c.name}</span>
                <span className="mt-1 text-xs text-[#666] sm:text-sm">{c._count.topics} topics wired</span>
              </Link>
            </li>
          ))}
        </ul>
        {categories.length === 0 ? (
          <p className="mt-8 rounded-md border border-dashed border-[#00e8ff]/25 bg-black/30 py-10 text-center text-sm text-[#666] sm:mt-10">
            No categories yet. Ingest or create from admin.
          </p>
        ) : null}
      </SiteContainer>
    </main>
  );
}
