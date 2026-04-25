import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Editorial Standards",
  description:
    "How Sypher News handles AI-assisted research, human editorial review, sourcing, framing, transparency, and corrections.",
};

export default function EditorialStandardsPage() {
  return (
    <InfoPage
      eyebrow="Standards"
      title="Editorial standards"
      intro="Sypher News pairs an AI-assisted research pipeline with a human editor who reviews every article before publication. The pipeline accelerates source gathering and framing analysis; editorial judgment stays with a person."
    >
      <InfoSection title="Human editorial review">
        <p>
          Every article is read end-to-end by Aaron Keating before it goes live. The editor checks sourcing, claim
          verification, framing balance, and clarity, and is responsible for any decision to publish, hold, or correct
          a piece. AI is a tool in the workflow — it is not the publisher.
        </p>
      </InfoSection>
      <InfoSection title="Sourcing">
        <p>
          Stories must identify source material wherever possible. We prefer direct source visibility, named
          institutions, and primary documents over unsupported claims or recycled summaries.
        </p>
      </InfoSection>
      <InfoSection title="Framing and bias">
        <p>
          Bias analysis at Sypher News is not presented as perfect truth. It is an editorial signal that explains how
          a story may be framed, where narrative pressure exists, and why that matters to readers.
        </p>
      </InfoSection>
      <InfoSection title="Transparency">
        <p>
          Readers see source lists, research notes, alignment rationale, and correction notices alongside each story.
          The goal is to show how the article was assembled — research first, editorial review second — and why a
          given framing assessment was reached.
        </p>
      </InfoSection>
      <InfoSection title="Corrections">
        <p>
          If a published story is wrong, incomplete, or misleading, we correct it visibly and preserve revision
          context when the change is editorially meaningful.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
