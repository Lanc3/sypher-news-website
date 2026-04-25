import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteArticleFormAction } from "@/app/admin/admin-actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
};

const STATUSES = ["all", "PUBLISHED", "DRAFT", "SCHEDULED", "ARCHIVED"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABELS: Record<Status, string> = {
  all: "All",
  PUBLISHED: "Published",
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  ARCHIVED: "Archived",
};

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/15 text-emerald-400/80",
  DRAFT: "bg-yellow-500/15 text-yellow-400/80",
  SCHEDULED: "bg-blue-500/15 text-blue-400/80",
  ARCHIVED: "bg-zinc-500/15 text-zinc-400/60",
};

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { q = "", status = "all", category = "all" } = await searchParams;
  const statusFilter =
    status === "DRAFT" || status === "SCHEDULED" || status === "PUBLISHED" || status === "ARCHIVED"
      ? status
      : null;

  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
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
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5 font-mono">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#444]">Content</p>
          <h1 className="mt-1 text-xl font-semibold text-[#e0e0e0]">Articles</h1>
        </div>
        <Link href="/admin/articles/new">
          <Button type="button" className="text-xs">
            + New article
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <form className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search title or slug…"
            className="min-h-9 min-w-[200px] flex-1 rounded-md border border-[#00e8ff]/20 bg-black/60 px-3 py-2 text-sm text-[#e0e0e0] placeholder-[#444] transition focus:border-[#00e8ff]/50 focus:outline-none focus:ring-1 focus:ring-[#00e8ff]/30 sm:max-w-xs"
          />
          <select
            name="category"
            defaultValue={category}
            className="min-h-9 rounded-md border border-[#00e8ff]/20 bg-black/60 px-3 py-2 text-sm text-[#e0e0e0] transition focus:border-[#00e8ff]/50 focus:outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((row) => (
              <option key={row.id} value={row.slug}>
                {row.name}
              </option>
            ))}
          </select>
          <Button type="submit" className="text-xs">
            Search
          </Button>
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => {
            const active = status === s;
            return (
              <button
                key={s}
                type="submit"
                name="status"
                value={s}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "border-[#00e8ff]/60 bg-[#00e8ff]/10 text-[#00e8ff]"
                    : "border-[#222] text-[#555] hover:border-[#444] hover:text-[#888]"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            );
          })}
          <input type="hidden" name="q" value={q} />
          <input type="hidden" name="category" value={category} />
        </div>
      </form>

      {/* Articles table */}
      {articles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#00e8ff]/15 bg-black/30 py-12 text-center">
          <p className="text-sm text-[#555]">No articles match these filters.</p>
          <Link href="/admin/articles" className="mt-2 inline-block text-xs text-[#00e8ff] hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#00e8ff]/10 bg-black/40">
          {/* Table header — desktop */}
          <div className="hidden grid-cols-[1fr_120px_140px_120px_auto] gap-4 border-b border-[#00e8ff]/10 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#3a3a4a] sm:grid">
            <span>Title</span>
            <span>Status</span>
            <span>Category</span>
            <span>Updated</span>
            <span />
          </div>

          <ul className="divide-y divide-[#00e8ff]/5">
            {articles.map((a) => (
              <li
                key={a.id}
                className="group grid grid-cols-1 gap-2 px-5 py-3.5 transition hover:bg-white/2 sm:grid-cols-[1fr_120px_140px_120px_auto] sm:items-center sm:gap-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="truncate text-sm text-[#bc13fe] hover:underline"
                  >
                    {a.title}
                  </Link>
                  <p className="mt-0.5 truncate text-[11px] text-[#3a3a4a]">
                    /news/{a.topic.category.slug}/{a.slug}
                  </p>
                </div>

                <div>
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_STYLES[a.status] ?? "bg-white/5 text-[#666]"}`}
                  >
                    {a.status.toLowerCase()}
                  </span>
                </div>

                <div className="text-xs text-[#666]">{a.topic.category.name}</div>

                <div className="text-[11px] tabular-nums text-[#444]">
                  {a.updatedAt.toISOString().slice(0, 10)}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/news/${a.topic.category.slug}/${a.slug}`}
                    className="rounded border border-[#333] px-2.5 py-1 text-[11px] text-[#666] transition hover:border-[#555] hover:text-[#c8c8c8]"
                  >
                    View
                  </Link>
                  <form action={deleteArticleFormAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button
                      type="submit"
                      className="rounded border border-red-500/20 px-2.5 py-1 text-[11px] text-red-500/60 transition hover:border-red-500/50 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-[#00e8ff]/5 px-5 py-3">
            <p className="text-[11px] text-[#3a3a4a]">
              {articles.length} {articles.length === 1 ? "article" : "articles"}
              {statusFilter ? ` · ${statusFilter.toLowerCase()}` : ""}
              {category !== "all" ? ` · ${category}` : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
