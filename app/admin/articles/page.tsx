import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteArticleFormAction } from "@/app/admin/admin-actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { topic: { include: { category: true } } },
  });

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl text-[#00ff41]">Articles</h1>
        <Link href="/admin/articles/new">
          <Button type="button" className="text-xs">
            New article
          </Button>
        </Link>
      </div>
      <ul className="space-y-3">
        {articles.map((a) => (
          <li
            key={a.id}
            className="flex flex-col gap-2 rounded border border-[#00ff41]/15 bg-black/40 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <Link href={`/admin/articles/${a.id}`} className="text-[#ff2bd6] hover:underline">
                {a.title}
              </Link>
              <p className="text-xs text-[#666]">
                /news/{a.topic.category.slug}/{a.slug}
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
