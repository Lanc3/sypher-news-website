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
    title: string;
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
  };
};

export function EditArticleForm({ article }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(article.title);
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
      title,
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
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error || "Save failed");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-4 font-mono">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Body markdown</Label>
        <textarea
          id="body"
          className="min-h-[280px] w-full rounded border border-[#00ff41]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={bodyMarkdown}
          onChange={(e) => setBodyMarkdown(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <textarea
          id="summary"
          className="min-h-[100px] w-full rounded border border-[#00ff41]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="research">Research markdown</Label>
        <textarea
          id="research"
          className="min-h-[160px] w-full rounded border border-[#00ff41]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={researchMarkdown}
          onChange={(e) => setResearchMarkdown(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="balance">Source balance summary</Label>
        <textarea
          id="balance"
          className="min-h-[80px] w-full rounded border border-[#00ff41]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
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
          className="min-h-[100px] w-full rounded border border-[#00ff41]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
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
          className="min-h-[80px] w-full rounded border border-[#00ff41]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
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
          className="min-h-[80px] w-full rounded border border-[#00ff41]/30 bg-[#080808] p-2 text-sm text-[#e0e0e0]"
          value={seoOgDescription}
          onChange={(e) => setSeoOgDescription(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
