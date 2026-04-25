"use client";

import Link from "next/link";
import { ArticleShareSaveActions } from "@/components/article-share-save-actions";

type ArticleFeedCardProps = {
  articleId: number;
  href: string;
  title: string;
  summary?: string | null;
  categoryName?: string | null;
  createdAt?: string | Date | null;
  transparency?: number | null;
  coverImageUrl?: string | null;
  coverImageThumbnailUrl?: string | null;
  isSaved?: boolean;
  onToggleSave?: (articleId: number, nextSaved: boolean) => void | Promise<void>;
};

export function ArticleFeedCard({
  articleId,
  href,
  title,
  summary,
  categoryName,
  createdAt,
  transparency,
  coverImageUrl,
  coverImageThumbnailUrl,
  isSaved = false,
  onToggleSave,
}: ArticleFeedCardProps) {
  const dateValue = createdAt ? new Date(createdAt) : null;
  const imageSrc = coverImageThumbnailUrl?.trim() || coverImageUrl?.trim() || null;

  return (
    <article className="panel panel-glow flex h-full flex-col p-3 sm:p-4">
      {imageSrc ? (
        <Link href={href} className="-mx-3 -mt-3 mb-3 overflow-hidden rounded-t-lg border-b border-[#00e8ff]/15 bg-black sm:-mx-4 sm:-mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-[16/10] h-auto w-full object-cover"
          />
        </Link>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] text-[#707070] sm:text-[11px]">
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
            <span className="rounded border border-[#00e8ff]/35 px-1 py-0.5 text-[#00e8ff]">T:{transparency}</span>
          </>
        ) : null}
      </div>

      <Link href={href} className="mt-2 font-mono text-sm font-semibold leading-snug text-[#00e8ff] transition hover:text-[#66f2ff] sm:text-base">
        {title}
      </Link>

      {summary ? <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#9a9a9a] sm:text-sm">{summary}</p> : null}

      <ArticleShareSaveActions
        articleId={articleId}
        href={href}
        title={title}
        compact
        initialSaved={isSaved}
        onToggleSave={onToggleSave}
      />
    </article>
  );
}
