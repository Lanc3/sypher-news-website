import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Editorial Standards",
  description: "How Sypher News handles AI-generated, deep-researched coverage, sourcing, framing, transparency, and corrections.",
};

export default function EditorialStandardsPage() {
  return (
    <InfoPage
      eyebrow="Standards"
      title="Editorial standards"
      intro="Sypher News is designed as an AI-generated, deep-researched news system, with the long-term goal of full automation across article, category, and topic generation."
    >
      <InfoSection title="Sourcing">
        <p>Even though the system is AI generated, stories should still identify source material whenever possible. We prefer direct source visibility over unsupported claims or recycled summaries.</p>
      </InfoSection>
      <InfoSection title="Framing and bias">
        <p>Bias analysis at Sypher News is not presented as perfect truth. It is an editorial signal that explains how a story may be framed, where narrative pressure exists, and why that matters to readers.</p>
      </InfoSection>
      <InfoSection title="Transparency">
        <p>When available, readers should see source lists, research notes, alignment rationale, and correction notices. The goal is to show how AI-generated reporting was assembled and why the system reached a given framing assessment.</p>
      </InfoSection>
      <InfoSection title="Corrections">
        <p>If a published story is wrong, incomplete, or misleading, we correct it visibly and preserve revision context when the change is editorially meaningful.</p>
      </InfoSection>
    </InfoPage>
  );
}
