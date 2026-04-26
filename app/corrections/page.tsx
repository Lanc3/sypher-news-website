import type { Metadata } from "next";
import { CorrectionFlowHero, CorrectionNoticeSample } from "@/components/info-visuals/correction-flow";
import { RichInfoPage, RichSection } from "@/components/rich-info-page";

export const metadata: Metadata = {
  title: "Corrections",
  description: "How Sypher News handles correction requests and visible story updates.",
};

const tocItems = [
  { id: "requesting", label: "Requesting a correction" },
  { id: "how-we-update", label: "How we update" },
  { id: "what-readers-expect", label: "What readers should expect" },
];

export default function CorrectionsPage() {
  return (
    <RichInfoPage
      eyebrow="Corrections"
      title="Corrections policy"
      intro="If we get something wrong, the correction should be visible, understandable, and proportional to the error."
      heroVisual={<CorrectionFlowHero />}
      tocItems={tocItems}
    >
      <RichSection id="requesting" title="Requesting a correction" revealIndex={0}>
        <p>
          Send correction requests to{" "}
          <a className="text-[#00e8ff] underline decoration-[#00e8ff]/40 underline-offset-4" href="mailto:editor@sypher.news">
            editor@sypher.news
          </a>{" "}
          with the article URL, the issue, and supporting evidence.
        </p>
      </RichSection>
      <RichSection id="how-we-update" title="How we update" revealIndex={1}>
        <p>
          We may revise headlines, summaries, sourcing notes, or transparency explanations. Material changes should be
          reflected in visible correction or revision notes.
        </p>
        <div className="mt-6">
          <CorrectionNoticeSample />
        </div>
      </RichSection>
      <RichSection id="what-readers-expect" title="What readers should expect" revealIndex={2}>
        <p>
          Corrections should clarify what changed and why. Minor copy edits may be folded into revision history without
          a full correction notice.
        </p>
      </RichSection>
    </RichInfoPage>
  );
}
