import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
    <main className="mx-auto max-w-3xl px-4 py-12 font-mono text-[#e0e0e0]">
      <p className="text-xs uppercase tracking-[0.3em] text-[#ff2bd6]">Category</p>
      <h1 className="mt-2 text-3xl text-[#00ff41]">{category.name}</h1>
      {category.description ? <p className="mt-3 text-sm text-[#9a9a9a]">{category.description}</p> : null}
      <ul className="mt-10 space-y-4">
        {articles.map((a) => (
          <li key={a.id}>
            <Link href={`/news/${category.slug}/${a.slug}`} className="text-lg text-[#ff2bd6] hover:underline">
              {a.title}
            </Link>
            {a.summary ? (
              <p className="mt-1 text-sm text-[#777]">
                {a.summary.length > 160 ? `${a.summary.slice(0, 160)}…` : a.summary}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      {articles.length === 0 ? <p className="mt-8 text-sm text-[#666]">No articles in this channel yet.</p> : null}
    </main>
  );
}
