"use client";

import { ArticleShareSaveActions } from "@/components/article-share-save-actions";

export function ShareActions({
  articleId,
  url,
  title,
  initialSaved = false,
}: {
  articleId: number;
  url: string;
  title: string;
  initialSaved?: boolean;
}) {
  return (
    <div className="panel border-[#00e8ff]/20 p-4 sm:p-5">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00e8ff]/80">Share or save this article</p>
      <ArticleShareSaveActions articleId={articleId} href={url} title={title} initialSaved={initialSaved} />
    </div>
  );
}
