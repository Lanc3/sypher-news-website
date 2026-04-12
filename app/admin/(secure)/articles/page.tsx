import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteArticleFormAction } from "@/app/admin/admin-actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
};

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { q = "", status = "all", category = "all" } = await searchParams;
  const statusFilter =
    status === "DRAFT" || status === "SCHEDULED" || status === "PUBLISHED" || status === "ARCHIVED" ? status : null;
  const articles = await prisma.article.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(category !== "all" ? { topic: { category: { slug: category } } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: { topic: { include: { category: true } } },
  });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-[#00e8ff]">Articles</h1>
          <p className="mt-2 text-sm text-[#888]">Filter by status, category, or slug and move stories through the publishing workflow.</p>
        </div>
        <Link href="/admin/articles/new">
          <Button type="button" className="text-xs">
            New article
          </Button>
        </Link>
      </div>
      <form className="grid gap-3 rounded border border-[#00e8ff]/15 bg-black/40 p-4 md:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title or slug"
          className="min-h-11 rounded border border-[#00e8ff]/30 bg-[#080808] px-3 py-2 text-sm text-[#e0e0e0]"
        />
        <select name="status" defaultValue={status} className="min-h-11 rounded border border-[#00e8ff]/30 bg-[#080808] px-3 py-2 text-sm text-[#e0e0e0]">
          <option value="all">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select name="category" defaultValue={category} className="min-h-11 rounded border border-[#00e8ff]/30 bg-[#080808] px-3 py-2 text-sm text-[#e0e0e0]">
          <option value="all">All categories</option>
          {categories.map((row) => (
            <option key={row.id} value={row.slug}>
              {row.name}
            </option>
          ))}
        </select>
        <Button type="submit">Apply filters</Button>
      </form>
      <ul className="space-y-3">
        {articles.map((a) => (
          <li
            key={a.id}
            className="flex flex-col gap-2 rounded border border-[#00e8ff]/15 bg-black/40 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <Link href={`/admin/articles/${a.id}`} className="text-[#bc13fe] hover:underline">
                {a.title}
              </Link>
              <p className="text-xs text-[#666]">
                {a.status} · /news/{a.topic.category.slug}/{a.slug}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild type="button" className="border-[#666]/40 text-xs text-[#aaa]">
                <Link href={`/news/${a.topic.category.slug}/${a.slug}`}>View</Link>
              </Button>
              <form action={deleteArticleFormAction}>
                <input type="hidden" name="id" value={a.id} />
                <Button type="submit" className="border-red-500/40 text-xs text-red-400 hover:shadow-red-500/20">
                  Delete
                </Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {articles.length === 0 ? <p className="text-sm text-[#666]">No articles yet.</p> : null}
    </div>
  );
}
