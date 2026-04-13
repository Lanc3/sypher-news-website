"use client";

import { useState } from "react";
import { MarkdownBody } from "@/components/markdown-body";

type Tab = "article" | "research" | "analysis";

function splitResearch(raw: string | null): { dossier: string; brief: string } {
  if (!raw) return { dossier: "", brief: "" };
  const marker = "## Analyst Brief";
  const idx = raw.indexOf(marker);
  if (idx < 0) return { dossier: raw, brief: "" };
  return { dossier: raw.slice(0, idx).trim(), brief: raw.slice(idx).trim() };
}

export function DisassemblyTabs({
  bodyMarkdown,
  researchMarkdown,
}: {
  bodyMarkdown: string;
  researchMarkdown: string | null;
}) {
  const [active, setActive] = useState<Tab>("article");
  const { dossier, brief } = splitResearch(researchMarkdown);
  const hasResearch = Boolean(dossier || brief);

  return (
    <div>
      <div className="flex gap-1 border-b border-[#00e8ff]/20 pb-0" role="tablist">
        <button
          role="tab"
          aria-selected={active === "article"}
          className={`rounded-t px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors sm:text-xs ${
            active === "article"
              ? "border border-b-0 border-[#00e8ff]/30 bg-[#00e8ff]/10 text-[#00e8ff]"
              : "text-[#888] hover:text-[#e0e0e0]"
          }`}
          onClick={() => setActive("article")}
        >
          Article
        </button>
        {dossier && (
          <button
            role="tab"
            aria-selected={active === "research"}
            className={`rounded-t px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors sm:text-xs ${
              active === "research"
                ? "border border-b-0 border-[#00e8ff]/30 bg-[#00e8ff]/10 text-[#00e8ff]"
                : "text-[#888] hover:text-[#e0e0e0]"
            }`}
            onClick={() => setActive("research")}
          >
            Raw Research
          </button>
        )}
        {brief && (
          <button
            role="tab"
            aria-selected={active === "analysis"}
            className={`rounded-t px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors sm:text-xs ${
              active === "analysis"
                ? "border border-b-0 border-[#00e8ff]/30 bg-[#00e8ff]/10 text-[#00e8ff]"
                : "text-[#888] hover:text-[#e0e0e0]"
            }`}
            onClick={() => setActive("analysis")}
          >
            Editorial Analysis
          </button>
        )}
      </div>

      {hasResearch && (
        <p className="mt-3 font-mono text-[11px] text-[#888] sm:text-xs">
          We show our work. Read the raw research, see how we interpreted it, or skip to the
          finished article.
        </p>
      )}

      <div role="tabpanel" className="mt-4">
        {active === "article" && <MarkdownBody content={bodyMarkdown} />}
        {active === "research" && dossier && (
          <div className="rounded border border-[#00e8ff]/15 bg-black/40 p-4 font-mono text-sm text-[#c8eef8]">
            <MarkdownBody content={dossier} />
          </div>
        )}
        {active === "analysis" && brief && (
          <div className="rounded border border-[#00e8ff]/15 bg-black/40 p-4 font-mono text-sm text-[#c8eef8]">
            <MarkdownBody content={brief} />
          </div>
        )}
      </div>
    </div>
  );
}
