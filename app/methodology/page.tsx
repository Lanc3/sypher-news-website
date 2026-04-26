import type { Metadata } from "next";
import { PipelineDiagram } from "@/components/info-visuals/pipeline-diagram";
import { VerificationTagLegend } from "@/components/info-visuals/verification-tag-legend";
import { infoLinkMagenta, RichInfoPage, RichSection } from "@/components/rich-info-page";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How every Sypher News article is built — the four-stage pipeline, verification tags, citation rules, and correction policy. Everything you need to audit our work.",
};

const tocItems = [
  { id: "pipeline", label: "The pipeline" },
  { id: "verification-tags", label: "Verification tags" },
  { id: "citation-rules", label: "Citation rules" },
  { id: "missing-voice", label: "Missing voice" },
  { id: "correction-policy", label: "Correction policy" },
  { id: "ai-disclosure", label: "AI disclosure" },
];

export default function MethodologyPage() {
  return (
    <RichInfoPage
      eyebrow="Methodology"
      title="How every Sypher News article is built — and how to check our work"
      intro="Each article passes through four research-pipeline stages and a final human editorial review before publication. We publish the intermediate artefacts alongside the article so readers can audit the reasoning."
      heroVisual={<PipelineDiagram />}
      tocItems={tocItems}
    >
      <RichSection id="pipeline" title="The pipeline" revealIndex={0}>
        <p>
          <strong className="text-[#e8e8e8]">1. Searcher.</strong> Runs 5–9 web queries across different angles
          (wire coverage, official statements, trade press, local reporting, critical analysis) and fetches the top
          results.
        </p>
        <p>
          <strong className="text-[#e8e8e8]">2. Analyst.</strong> Groups results by claim (not by source), tags each
          claim with a verification level, and writes a source-quality assessment — wire vs. trade vs. blog vs.
          official — plus an explicit list of framing choices and information gaps.
        </p>
        <p>
          <strong className="text-[#e8e8e8]">3. Writer.</strong> A local language model composes the article. It
          must open with the framing comparison and name the missing voices before presenting the factual summary.
          Every factual claim must carry a source URL.
        </p>
        <p>
          <strong className="text-[#e8e8e8]">4. Critic.</strong> A second pass checks for unsourced claims, invalid
          citation URLs, thin analysis, and missing sections. If anything fails, the article goes back for revision
          or is held from publication.
        </p>
      </RichSection>

      <RichSection id="verification-tags" title="Verification tags" revealIndex={1}>
        <p>
          <strong className="text-[#e8e8e8]">VERIFIED</strong> — corroborated by three or more independent sources.
        </p>
        <p>
          <strong className="text-[#e8e8e8]">PARTIALLY VERIFIED</strong> — supported by exactly two independent
          sources.
        </p>
        <p>
          <strong className="text-[#e8e8e8]">SINGLE SOURCE</strong> — reported by only one outlet. Explicitly
          flagged, not hidden.
        </p>
        <p>
          <strong className="text-[#e8e8e8]">UNVERIFIABLE</strong> — sources disagree, or the claim cannot be
          checked against available evidence.
        </p>
        <p>The tags describe corroboration across cited URLs, not a judgment of truth.</p>
        <VerificationTagLegend />
      </RichSection>

      <RichSection id="citation-rules" title="Citation rules" revealIndex={2}>
        <p>Every article includes inline citations. No claim stands alone.</p>
        <p>URLs are validated against the actual fetched source list.</p>
        <p>Quotes are copied verbatim from the fetched extracts.</p>
        <p>
          When a source&apos;s framing is noted, we link to the specific article where that word choice appears.
        </p>
      </RichSection>

      <RichSection id="missing-voice" title="What counts as a missing voice" revealIndex={3}>
        <p>
          A missing voice must be directly affected by the event, capable of answering a question the coverage
          cannot answer without them, and specific — &quot;critics&quot; or &quot;the public&quot; do not count.
        </p>
      </RichSection>

      <RichSection id="correction-policy" title="Correction policy" revealIndex={4}>
        <p>
          When we are wrong, we fix the article inline and add a dated correction note at the end. We do not silently
          edit published pieces. Report errors:{" "}
          <a href="mailto:editor@sypher-news.com" className={infoLinkMagenta}>
            editor@sypher-news.com
          </a>
        </p>
      </RichSection>

      <RichSection id="ai-disclosure" title="AI disclosure" revealIndex={5}>
        <p>
          Sypher News articles are drafted by a local language model following the pipeline above. No third-party AI
          API sees the research stream. Each article is reviewed by a human editor (Aaron Keating) before
          publication.
        </p>
      </RichSection>
    </RichInfoPage>
  );
}
