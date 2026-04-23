import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Aaron Keating, the Irish software engineer behind Sypher News, and learn why this publication focuses on clear, bias-aware reporting.",
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="Who I am and why Sypher News exists"
      intro="I created Sypher News to cut through the fluff, spin, and bias that dominate too many mainstream headlines. This is not a race to be first. It is a commitment to making coverage clearer, more transparent, and more useful."
    >
      <InfoSection title="What Sypher News actually is">
        <p>
          Every article on this site breaks a story into three layers: the shared factual core, the framing
          differences between outlets, and the perspectives that were left out. I publish the supporting research so
          readers can inspect how each piece was built.
        </p>
      </InfoSection>

      <InfoSection title="Who runs Sypher News">
        <p>
          Sypher News is written and edited by <strong>Aaron Keating</strong>. I am Irish and have worked as a software
          engineer for 18 years, with deep expertise in technology and AI systems.
        </p>
        <p>
          Over that time, I have built large-scale news software, including platforms for medical publishing and the
          Mindo mobile app for Android and iOS while working with Medical Independent. I have spent years building
          systems around newsroom workflows, publishing standards, and article quality controls.
        </p>
        <p>
          Editorial decisions are made by me, and accountability sits with me. If something is wrong, corrections are
          added directly to the article with clear timestamps.
        </p>
        <p>
          Contact:{" "}
          <a
            href="mailto:editor@sypher-news.com"
            className="text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-4 hover:decoration-[#bc13fe]"
          >
            editor@sypher-news.com
          </a>
        </p>
      </InfoSection>

      <InfoSection title="How the analysis is produced">
        <p>
          Sypher News uses an AI-assisted research pipeline to gather sources, cluster claims, and map coverage
          differences. The goal is not to replace editorial judgment, but to make the research process faster and more
          consistent.
        </p>
        <p>
          Every article passes through structured stages and then a final editorial review before publication. A longer
          description lives on the{" "}
          <a
            href="/methodology"
            className="text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-4 hover:decoration-[#bc13fe]"
          >
            methodology page
          </a>
          .
        </p>
      </InfoSection>

      <InfoSection title="What you won't find here">
        <p>
          Clickbait. Empty outrage. Rewritten wire copy with no extra value. The aim here is straightforward: reduce
          noise, expose framing choices, and give readers a cleaner signal than typical mainstream coverage.
        </p>
      </InfoSection>

      <InfoSection title="Editorial independence and funding">
        <p>
          Sypher News is an independent project. Revenue and monetization never determine coverage decisions, and no
          external commercial partner directs editorial output.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
