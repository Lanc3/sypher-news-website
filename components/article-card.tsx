import Link from "next/link";

type ArticleCardProps = {
  href: string;
  title: string;
  summary?: string | null;
  categoryName?: string | null;
  createdAt?: string | Date | null;
  transparency?: number | null;
  featured?: boolean;
};

export function ArticleCard({ href, title, summary, categoryName, createdAt, transparency, featured = false }: ArticleCardProps) {
  const dateValue = createdAt ? new Date(createdAt) : null;
  return (
    <Link href={href} className="panel panel-glow flex h-full flex-col p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-[#707070] sm:text-xs">
        {categoryName ? <span className="font-medium text-[#bc13fe]/90">{categoryName}</span> : null}
        {dateValue ? (
          <>
            {categoryName ? <span aria-hidden className="text-[#555]">·</span> : null}
            <time dateTime={dateValue.toISOString()}>{dateValue.toISOString().slice(0, 10)}</time>
          </>
        ) : null}
        {transparency != null ? (
          <>
            <span aria-hidden className="text-[#555]">·</span>
            <span className="rounded border border-[#00e8ff]/35 px-1.5 py-0.5 text-[#00e8ff]">T:{transparency}</span>
          </>
        ) : null}
        {featured ? (
          <>
            <span aria-hidden className="text-[#555]">·</span>
            <span className="text-[#00e8ff]/80">Featured</span>
          </>
        ) : null}
      </div>
      <span className="mt-3 font-mono text-base font-semibold leading-snug text-[#00e8ff] sm:text-lg">{title}</span>
      {summary ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#9a9a9a]">{summary}</p> : null}
    </Link>
  );
}
