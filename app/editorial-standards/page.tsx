import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Editorial Standards",
  description: "How Sypher News handles sourcing, framing, transparency, corrections, and bias analysis.",
};

export default function EditorialStandardsPage() {
  return (
    <InfoPage
      eyebrow="Standards"
      title="Editorial standards"
      intro="Sypher News is designed to disassemble mainstream coverage so readers can evaluate bias, sourcing depth, and framing more directly."
    >
      <InfoSection title="Sourcing">
        <p>Stories should identify source material whenever possible. We prefer direct source visibility over unsupported claims or recycled summaries.</p>
      </InfoSection>
      <InfoSection title="Framing and bias">
        <p>Bias analysis at Sypher News is not presented as perfect truth. It is an editorial signal that explains how a story may be framed, where narrative pressure exists, and why that matters to readers.</p>
      </InfoSection>
      <InfoSection title="Transparency">
        <p>When available, readers should see source lists, research notes, alignment rationale, and correction notices. The goal is to show how the reporting was assembled.</p>
      </InfoSection>
      <InfoSection title="Corrections">
        <p>If a published story is wrong, incomplete, or misleading, we correct it visibly and preserve revision context when the change is editorially meaningful.</p>
      </InfoSection>
    </InfoPage>
  );
}
