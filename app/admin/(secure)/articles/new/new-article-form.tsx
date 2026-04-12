"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createArticleAdminAction } from "@/app/admin/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewArticleForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [featured, setFeatured] = useState(false);
  const [categorySlug, setCategorySlug] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorSlug, setAuthorSlug] = useState("");
  const [authorTitle, setAuthorTitle] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await createArticleAdminAction({
      slug,
      title,
      status,
      featured,
      categorySlug,
      categoryName: categoryName || undefined,
      summary: summary || null,
      bodyMarkdown: body,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      authorName: authorName || null,
      authorSlug: authorSlug || null,
      authorTitle: authorTitle || null,
      authorBio: authorBio || null,
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error || "Failed");
      return;
    }
    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4 font-mono">
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
            onChange={(e) => setStatus(e.target.value as typeof status)}
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
          <Label htmlFor="catSlug">Category slug</Label>
          <Input id="catSlug" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="catName">Category name (optional)</Label>
          <Input id="catName" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
        </div>
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
          <Input id="authorName" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Sypher Desk" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorSlug">Author slug</Label>
          <Input id="authorSlug" value={authorSlug} onChange={(e) => setAuthorSlug(e.target.value)} placeholder="sypher-desk" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorTitle">Author title</Label>
          <Input id="authorTitle" value={authorTitle} onChange={(e) => setAuthorTitle(e.target.value)} placeholder="Editorial desk" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="authorBio">Author bio</Label>
        <textarea
          id="authorBio"
          className="min-h-[80px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={authorBio}
          onChange={(e) => setAuthorBio(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <textarea
          id="summary"
          className="min-h-[80px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Body markdown</Label>
        <textarea
          id="body"
          className="min-h-[240px] w-full rounded border border-[#00e8ff]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>
      <p className="text-xs text-[#666]">
        Meta description target: 150 to 160 characters. Summary length: {summary.length} characters.
      </p>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Create"}
      </Button>
    </form>
  );
}
