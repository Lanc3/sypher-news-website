import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const authors = await prisma.author.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { articleLinks: true } },
    },
  });

  return (
    <div className="space-y-5 font-mono">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#444]">Content</p>
        <h1 className="mt-1 text-xl font-semibold text-[#e0e0e0]">Authors</h1>
        <p className="mt-1 text-sm text-[#666]">
          Public bylines and bios. Authors are created from article edit flows.
        </p>
      </div>

      {authors.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#00e8ff]/15 bg-black/30 py-12 text-center">
          <p className="text-sm text-[#555]">No authors yet.</p>
          <p className="mt-1 text-xs text-[#3a3a4a]">Add one from an article edit form.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#00e8ff]/10 bg-black/40">
          <ul className="divide-y divide-[#00e8ff]/5">
            {authors.map((author) => (
              <li
                key={author.id}
                className="group flex items-start justify-between gap-6 px-5 py-4 transition hover:bg-white/2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-[#bc13fe]">{author.name}</p>
                    {author.title ? (
                      <span className="text-xs text-[#555]">{author.title}</span>
                    ) : null}
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[#444]">
                      {author._count.articleLinks} {author._count.articleLinks === 1 ? "story" : "stories"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#3a3a4a]">/{author.slug}</p>
                  {author.bio ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#666]">{author.bio}</p>
                  ) : null}
                </div>
                <Link
                  href={`/authors/${author.slug}`}
                  className="shrink-0 text-xs text-[#555] opacity-0 transition hover:text-[#00e8ff] group-hover:opacity-100"
                >
                  View page →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
