import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Corrections",
  description: "How Sypher News handles correction requests and visible story updates.",
};

export default function CorrectionsPage() {
  return (
    <InfoPage
      eyebrow="Corrections"
      title="Corrections policy"
      intro="If we get something wrong, the correction should be visible, understandable, and proportional to the error."
    >
      <InfoSection title="Requesting a correction">
        <p>Send correction requests to <a className="text-[#00e8ff] underline decoration-[#00e8ff]/40 underline-offset-4" href="mailto:editor@sypher.news">editor@sypher.news</a> with the article URL, the issue, and supporting evidence.</p>
      </InfoSection>
      <InfoSection title="How we update">
        <p>We may revise headlines, summaries, sourcing notes, or transparency explanations. Material changes should be reflected in visible correction or revision notes.</p>
      </InfoSection>
      <InfoSection title="What readers should expect">
        <p>Corrections should clarify what changed and why. Minor copy edits may be folded into revision history without a full correction notice.</p>
      </InfoSection>
    </InfoPage>
  );
}
