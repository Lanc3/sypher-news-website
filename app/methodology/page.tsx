import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How every Sypher News article is built — the four-stage pipeline, verification tags, citation rules, and correction policy. Everything you need to audit our work.",
};

export default function MethodologyPage() {
  return (
    <InfoPage
      eyebrow="Methodology"
      title="How every Sypher News article is built — and how to check our work"
      intro="Each article passes through four automated stages before any human editing. We publish the intermediate artefacts alongside the article so readers can audit the reasoning."
    >
      <InfoSection title="The pipeline">
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
      </InfoSection>

      <InfoSection title="Verification tags">
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
      </InfoSection>

      <InfoSection title="Citation rules">
        <p>Every article includes inline citations. No claim stands alone.</p>
        <p>URLs are validated against the actual fetched source list.</p>
        <p>Quotes are copied verbatim from the fetched extracts.</p>
        <p>
          When a source&apos;s framing is noted, we link to the specific article where that word choice appears.
        </p>
      </InfoSection>

      <InfoSection title="What counts as a missing voice">
        <p>
          A missing voice must be directly affected by the event, capable of answering a question the coverage
          cannot answer without them, and specific — &quot;critics&quot; or &quot;the public&quot; do not count.
        </p>
      </InfoSection>

      <InfoSection title="Correction policy">
        <p>
          When we are wrong, we fix the article inline and add a dated correction note at the end. We do not silently
          edit published pieces. Report errors:{" "}
          <a
            href="mailto:editor@sypher-news.com"
            className="text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-4 hover:decoration-[#bc13fe]"
          >
            editor@sypher-news.com
          </a>
        </p>
      </InfoSection>

      <InfoSection title="AI disclosure">
        <p>
          Sypher News articles are drafted by a local language model following the pipeline above. No third-party AI
          API sees the research stream. Each article is reviewed by a human editor (Aaron Keating) before
          publication.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
