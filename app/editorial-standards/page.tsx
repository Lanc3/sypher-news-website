import type { Metadata } from "next";
import { PrinciplesRing } from "@/components/info-visuals/principles-grid";
import { RichInfoPage, RichSection } from "@/components/rich-info-page";
import { BookOpen, Eye, FileWarning, Scale, UserRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Editorial Standards",
  description:
    "How Sypher News handles AI-assisted research, human editorial review, sourcing, framing, transparency, and corrections.",
};

const tocItems = [
  { id: "human-review", label: "Human review" },
  { id: "sourcing", label: "Sourcing" },
  { id: "framing", label: "Framing & bias" },
  { id: "transparency", label: "Transparency" },
  { id: "corrections", label: "Corrections" },
];

export default function EditorialStandardsPage() {
  return (
    <RichInfoPage
      eyebrow="Standards"
      title="Editorial standards"
      intro="Sypher News pairs an AI-assisted research pipeline with a human editor who reviews every article before publication. The pipeline accelerates source gathering and framing analysis; editorial judgment stays with a person."
      heroVisual={<PrinciplesRing />}
      tocItems={tocItems}
    >
      <RichSection id="human-review" title="Human editorial review" icon={UserRound} kicker="People" revealIndex={0}>
        <p>
          Every article is read end-to-end by Aaron Keating before it goes live. The editor checks sourcing, claim
          verification, framing balance, and clarity, and is responsible for any decision to publish, hold, or correct
          a piece. AI is a tool in the workflow — it is not the publisher.
        </p>
      </RichSection>
      <RichSection id="sourcing" title="Sourcing" icon={BookOpen} kicker="Evidence" revealIndex={1}>
        <p>
          Stories must identify source material wherever possible. We prefer direct source visibility, named
          institutions, and primary documents over unsupported claims or recycled summaries.
        </p>
      </RichSection>
      <RichSection id="framing" title="Framing and bias" icon={Scale} kicker="Signal" revealIndex={2}>
        <p>
          Bias analysis at Sypher News is not presented as perfect truth. It is an editorial signal that explains how
          a story may be framed, where narrative pressure exists, and why that matters to readers.
        </p>
      </RichSection>
      <RichSection id="transparency" title="Transparency" icon={Eye} kicker="Process" revealIndex={3}>
        <p>
          Readers see source lists, research notes, alignment rationale, and correction notices alongside each story.
          The goal is to show how the article was assembled — research first, editorial review second — and why a
          given framing assessment was reached.
        </p>
      </RichSection>
      <RichSection id="corrections" title="Corrections" icon={FileWarning} kicker="Accountability" revealIndex={4}>
        <p>
          If a published story is wrong, incomplete, or misleading, we correct it visibly and preserve revision
          context when the change is editorially meaningful.
        </p>
      </RichSection>
    </RichInfoPage>
  );
}
