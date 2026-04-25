import Link from "next/link";
import { ArticleShareSaveActions } from "@/components/article-share-save-actions";
import { AiDisclosurePill } from "@/components/ai-disclosure-pill";
import { CoverImageFallback } from "@/components/cover-image-fallback";

type ArticleCardProps = {
  articleId: number;
  href: string;
  title: string;
  summary?: string | null;
  categoryName?: string | null;
  createdAt?: string | Date | null;
  transparency?: number | null;
  featured?: boolean;
  compact?: boolean;
  coverImageUrl?: string | null;
  coverImageThumbnailUrl?: string | null;
};

export function ArticleCard({
  articleId,
  href,
  title,
  summary,
  categoryName,
  createdAt,
  transparency,
  featured = false,
  compact = false,
  coverImageUrl,
  coverImageThumbnailUrl,
}: ArticleCardProps) {
  const dateValue = createdAt ? new Date(createdAt) : null;
  // Prefer the thumbnail for cards; fall back to the full-size URL.
  const imageSrc = coverImageThumbnailUrl?.trim() || coverImageUrl?.trim() || null;
  return (
    <article className={`panel panel-glow flex h-full flex-col ${compact ? "p-3 sm:p-4" : "p-4 sm:p-5"}`}>
      <Link
        href={href}
        className={`${compact ? "-mx-3 -mt-3 mb-3 sm:-mx-4 sm:-mt-4" : "-mx-4 -mt-4 mb-4 sm:-mx-5 sm:-mt-5"} block overflow-hidden rounded-t-lg border-b border-[#00e8ff]/15 bg-black`}
      >
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            loading={featured ? "eager" : "lazy"}
            decoding="async"
            className="aspect-[16/9] h-auto w-full object-cover"
          />
        ) : (
          <CoverImageFallback title={title} categoryName={categoryName} variant="card" />
        )}
      </Link>
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
        <span aria-hidden className="text-[#555]">·</span>
        <AiDisclosurePill compact />
      </div>
      <Link href={href} className={`mt-2 font-mono font-semibold leading-snug text-[#00e8ff] transition hover:text-[#66f2ff] ${compact ? "text-sm sm:text-base" : "text-base sm:text-lg"}`}>
        {title}
      </Link>
      {summary ? (
        <p className={`mt-2 leading-relaxed text-[#9a9a9a] ${compact ? "line-clamp-2 text-xs sm:text-sm" : "line-clamp-3 text-sm"}`}>
          {summary}
        </p>
      ) : null}
      <ArticleShareSaveActions
        articleId={articleId}
        href={href}
        title={title}
        compact={compact}
      />
    </article>
  );
}
