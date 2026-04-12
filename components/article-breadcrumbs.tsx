import Link from "next/link";

export function ArticleBreadcrumbs({
  categorySlug,
  categoryName,
  title,
}: {
  categorySlug: string;
  categoryName: string;
  title: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs font-mono text-[#7f7f7f]">
      <Link href="/" className="hover:text-[#00e8ff]">
        Home
      </Link>
      <span aria-hidden>/</span>
      <Link href="/news" className="hover:text-[#00e8ff]">
        News
      </Link>
      <span aria-hidden>/</span>
      <Link href={`/news/${categorySlug}`} className="hover:text-[#00e8ff]">
        {categoryName}
      </Link>
      <span aria-hidden>/</span>
      <span className="truncate text-[#bc13fe]">{title}</span>
    </nav>
  );
}
