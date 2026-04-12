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
    <div className="space-y-6 font-mono">
      <div>
        <h1 className="text-2xl text-[#00e8ff]">Authors</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#888]">
          Public bylines, bios, and author archive pages. Authors are currently managed from article edit flows and surfaced here for review.
        </p>
      </div>

      <ul className="space-y-3">
        {authors.map((author) => (
          <li key={author.id} className="rounded border border-[#00e8ff]/15 bg-black/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg text-[#bc13fe]">{author.name}</p>
                <p className="mt-1 text-xs text-[#666]">/{author.slug} · {author._count.articleLinks} linked stories</p>
                {author.title ? <p className="mt-2 text-sm text-[#a0a0a0]">{author.title}</p> : null}
                {author.bio ? <p className="mt-2 text-sm text-[#777]">{author.bio}</p> : null}
              </div>
              <Link href={`/authors/${author.slug}`} className="text-xs text-[#00e8ff] hover:underline">
                View public page
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {authors.length === 0 ? <p className="text-sm text-[#666]">No authors yet. Add one from an article edit form.</p> : null}
    </div>
  );
}
