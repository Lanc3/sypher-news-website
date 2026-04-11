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
  const [categorySlug, setCategorySlug] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await createArticleAdminAction({
      slug,
      title,
      categorySlug,
      categoryName: categoryName || undefined,
      summary: summary || null,
      bodyMarkdown: body,
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
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Create"}
      </Button>
    </form>
  );
}
