"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveArticleAction } from "@/app/admin/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  article: {
    id: number;
    slug: string;
    title: string;
    status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
    featured: boolean;
    bodyMarkdown: string;
    summary: string | null;
    researchMarkdown: string | null;
    sourceBalanceSummary: string | null;
    articleAlignmentLabel: string | null;
    articleAlignmentConfidence: number | null;
    articleAlignmentRationale: string | null;
    seoMetaTitle: string | null;
    seoMetaDescription: string | null;
    seoKeywords: string | null;
    seoOgTitle: string | null;
    seoOgDescription: string | null;
    publishedAt: Date | null;
    scheduledFor: Date | null;
    topic: { category: { slug: string } };
    authorLinks: Array<{
      author: {
        slug: string;
        name: string;
        title: string | null;
        bio: string | null;
      };
    }>;
    revisions: Array<{ id: string; summary: string; createdAt: Date }>;
    corrections: Array<{ id: string; summary: string; details: string | null; createdAt: Date }>;
  };
};

export function EditArticleForm({ article }: Props) {
  const router = useRouter();
  const primaryAuthor = article.authorLinks[0]?.author;
  const [slug, setSlug] = useState(article.slug);
  const [title, setTitle] = useState(article.title);
  const [status, setStatus] = useState<Props["article"]["status"]>(article.status);
  const [featured, setFeatured] = useState(article.featured);
  const [bodyMarkdown, setBodyMarkdown] = useState(article.bodyMarkdown);
  const [summary, setSummary] = useState(article.summary ?? "");
  const [researchMarkdown, setResearchMarkdown] = useState(article.researchMarkdown ?? "");
  const [sourceBalanceSummary, setSourceBalanceSummary] = useState(article.sourceBalanceSummary ?? "");
  const [articleAlignmentLabel, setArticleAlignmentLabel] = useState(article.articleAlignmentLabel ?? "");
  const [articleAlignmentConfidence, setArticleAlignmentConfidence] = useState(
    article.articleAlignmentConfidence != null ? String(article.articleAlignmentConfidence) : "",
  );
  const [articleAlignmentRationale, setArticleAlignmentRationale] = useState(article.articleAlignmentRationale ?? "");
  const [seoMetaTitle, setSeoMetaTitle] = useState(article.seoMetaTitle ?? "");
  const [seoMetaDescription, setSeoMetaDescription] = useState(article.seoMetaDescription ?? "");
  const [seoKeywords, setSeoKeywords] = useState(article.seoKeywords ?? "");
  const [seoOgTitle, setSeoOgTitle] = useState(article.seoOgTitle ?? "");
  const [seoOgDescription, setSeoOgDescription] = useState(article.seoOgDescription ?? "");
  const [publishedAt, setPublishedAt] = useState(article.publishedAt ? article.publishedAt.toISOString().slice(0, 16) : "");
  const [scheduledFor, setScheduledFor] = useState(article.scheduledFor ? article.scheduledFor.toISOString().slice(0, 16) : "");
  const [authorName, setAuthorName] = useState(primaryAuthor?.name ?? "");
  const [authorSlug, setAuthorSlug] = useState(primaryAuthor?.slug ?? "");
  const [authorTitle, setAuthorTitle] = useState(primaryAuthor?.title ?? "");
  const [authorBio, setAuthorBio] = useState(primaryAuthor?.bio ?? "");
  const [revisionSummary, setRevisionSummary] = useState("");
  const [correctionSummary, setCorrectionSummary] = useState("");
  const [correctionDetails, setCorrectionDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const confRaw = articleAlignmentConfidence.trim();
    const conf =
      confRaw === ""
        ? null
        : Number.isFinite(Number(confRaw))
          ? Math.min(1, Math.max(0, Number(confRaw)))
          : null;
    const res = await saveArticleAction({
      id: article.id,
      slug,
      title,
      status,
      featured,
      bodyMarkdown,
      summary: summary || null,
      researchMarkdown: researchMarkdown || null,
      sourceBalanceSummary: sourceBalanceSummary || null,
      articleAlignmentLabel: articleAlignmentLabel || null,
      articleAlignmentConfidence: conf,
      articleAlignmentRationale: articleAlignmentRationale || null,
      seoMetaTitle: seoMetaTitle || null,
      seoMetaDescription: seoMetaDescription || null,
      seoKeywords: seoKeywords || null,
      seoOgTitle: seoOgTitle || null,
      seoOgDescription: seoOgDescription || null,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      authorName: authorName || null,
      authorSlug: authorSlug || null,
      authorTitle: authorTitle || null,
      authorBio: authorBio || null,
      revisionSummary: revisionSummary || null,
      correctionSummary: correctionSummary || null,
      correctionDetails: correctionDetails || null,
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error || "Save failed");
      return;
    }
    setRevisionSummary("");
    setCorrectionSummary("");
    setCorrectionDetails("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-4xl space-y-6 font-mono">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Props["article"]["status"])}
            className="min-h-11 w-full rounded border border-[#00e8ff]/30 bg-[#080808] px-3 py-2 text-sm text-[#e0e0e0]"
          >
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end text-sm text-[#aaa]">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-[#00e8ff]" />
          Featured on homepage
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="publishedAt">Published at</Label>
          <Input id="publishedAt" type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledFor">Scheduled for</Label>
          <Input id="scheduledFor" type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="authorName">Author name</Label>
          <Input id="authorName" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorSlug">Author slug</Label>
          <Input id="authorSlug" value={authorSlug} onChange={(e) => setAuthorSlug(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorTitle">Author title</Label>
          <Input id="authorTitle" value={authorTitle} onChange={(e) => setAuthorTitle(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="authorBio">Author bio</Label>
        <textarea
          id="authorBio"
          className="min-h-[90px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={authorBio}
          onChange={(e) => setAuthorBio(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Body markdown</Label>
        <textarea
          id="body"
          className="min-h-[280px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={bodyMarkdown}
          onChange={(e) => setBodyMarkdown(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <textarea
          id="summary"
          className="min-h-[100px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="research">Research markdown</Label>
        <textarea
          id="research"
          className="min-h-[160px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={researchMarkdown}
          onChange={(e) => setResearchMarkdown(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="balance">Source balance summary</Label>
        <textarea
          id="balance"
          className="min-h-[80px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={sourceBalanceSummary}
          onChange={(e) => setSourceBalanceSummary(e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="alabel">Alignment label</Label>
          <Input id="alabel" value={articleAlignmentLabel} onChange={(e) => setArticleAlignmentLabel(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aconf">Alignment confidence (0–1)</Label>
          <Input id="aconf" value={articleAlignmentConfidence} onChange={(e) => setArticleAlignmentConfidence(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="arat">Alignment rationale</Label>
        <textarea
          id="arat"
          className="min-h-[100px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={articleAlignmentRationale}
          onChange={(e) => setArticleAlignmentRationale(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mt">SEO meta title</Label>
        <Input id="mt" value={seoMetaTitle} onChange={(e) => setSeoMetaTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="md">SEO meta description</Label>
        <textarea
          id="md"
          className="min-h-[80px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={seoMetaDescription}
          onChange={(e) => setSeoMetaDescription(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kw">SEO keywords</Label>
        <Input id="kw" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ogt">OG title</Label>
        <Input id="ogt" value={seoOgTitle} onChange={(e) => setSeoOgTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ogd">OG description</Label>
        <textarea
          id="ogd"
          className="min-h-[80px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={seoOgDescription}
          onChange={(e) => setSeoOgDescription(e.target.value)}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2 rounded border border-[#00e8ff]/15 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#00e8ff]/70">Revision log</p>
          <textarea
            className="min-h-[90px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
            value={revisionSummary}
            onChange={(e) => setRevisionSummary(e.target.value)}
            placeholder="Add a revision summary for this update."
          />
          <ul className="space-y-2 text-xs text-[#888]">
            {article.revisions.map((revision) => (
              <li key={revision.id}>
                {revision.createdAt.toISOString().slice(0, 10)} · {revision.summary}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2 rounded border border-[#00e8ff]/15 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#00e8ff]/70">Correction notice</p>
          <textarea
            className="min-h-[90px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
            value={correctionSummary}
            onChange={(e) => setCorrectionSummary(e.target.value)}
            placeholder="Add a correction summary when the public story needs one."
          />
          <textarea
            className="min-h-[90px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
            value={correctionDetails}
            onChange={(e) => setCorrectionDetails(e.target.value)}
            placeholder="Correction details"
          />
          <ul className="space-y-2 text-xs text-[#888]">
            {article.corrections.map((notice) => (
              <li key={notice.id}>
                {notice.createdAt.toISOString().slice(0, 10)} · {notice.summary}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rounded border border-[#00e8ff]/15 bg-black/30 p-4 text-xs text-[#888]">
        <p>Summary length: {summary.length} characters</p>
        <p>Meta title length: {seoMetaTitle.length} characters</p>
        <p>Meta description length: {seoMetaDescription.length} characters</p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button asChild type="button" className="border-[#666]/40 text-[#aaa]">
          <a href={`/news/${article.topic.category.slug}/${slug}`} target="_blank" rel="noreferrer">
            Preview public page
          </a>
        </Button>
      </div>
    </form>
  );
}
