import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteContainer } from "@/components/site-container";

export const dynamic = "force-dynamic";
export const revalidate = 60;

type Props = { params: Promise<{ category: string }> };

export default async function CategoryArticlesPage({ params }: Props) {
  const { category: categorySlug } = await params;
  let category = null as Awaited<ReturnType<typeof prisma.category.findUnique>>;
  try {
    category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
  } catch {
    category = null;
  }
  if (!category) notFound();

  let articles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];
  try {
    articles = await prisma.article.findMany({
      where: { topic: { categoryId: category.id } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { topic: true },
    });
  } catch {
    articles = [];
  }

  return (
    <main className="flex-1 py-10 sm:py-14">
      <SiteContainer max="md">
        <header className="panel px-5 py-6 sm:px-8 sm:py-8">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-[#bc13fe] sm:text-xs">Category</p>
          <h1 className="mt-2 font-mono text-2xl font-bold tracking-tight text-[#00e8ff] sm:text-3xl lg:text-4xl">{category.name}</h1>
          {category.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#9a9a9a] sm:text-base">{category.description}</p>
          ) : null}
        </header>

        <ul className="mt-8 space-y-3 sm:mt-10 sm:space-y-4">
          {articles.map((a) => (
            <li key={a.id}>
              <Link
                href={`/news/${category.slug}/${a.slug}`}
                className="panel panel-glow block px-4 py-4 sm:px-5 sm:py-5"
              >
                <span className="font-mono text-base font-semibold leading-snug text-[#bc13fe] sm:text-lg">{a.title}</span>
                {a.summary ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#777] sm:line-clamp-3">
                    {a.summary.length > 220 ? `${a.summary.slice(0, 220)}…` : a.summary}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
        {articles.length === 0 ? (
          <p className="mt-8 rounded-md border border-dashed border-[#00e8ff]/25 bg-black/30 py-10 text-center text-sm text-[#666] sm:mt-10">
            No articles in this channel yet.
          </p>
        ) : null}
      </SiteContainer>
    </main>
  );
}
