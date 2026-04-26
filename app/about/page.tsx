import type { Metadata } from "next";
import { AboutAntiPatternGrid, AboutPortraitCard } from "@/components/info-visuals/about-portrait-card";
import { infoLinkMagenta, RichInfoPage, RichSection } from "@/components/rich-info-page";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Aaron Keating, the Irish software engineer behind Sypher News, and learn why this publication focuses on clear, bias-aware reporting.",
};

const tocItems = [
  { id: "what-sypher-is", label: "What Sypher News is" },
  { id: "who-runs", label: "Who runs it" },
  { id: "how-produced", label: "How analysis is produced" },
  { id: "what-you-wont-find", label: "What you won't find" },
  { id: "independence", label: "Independence & funding" },
];

export default function AboutPage() {
  return (
    <RichInfoPage
      eyebrow="About"
      title="Who I am and why Sypher News exists"
      intro="I created Sypher News to cut through the fluff, spin, and bias that dominate too many mainstream headlines. This is not a race to be first. It is a commitment to making coverage clearer, more transparent, and more useful."
      heroVisual={<AboutPortraitCard />}
      tocItems={tocItems}
    >
      <RichSection id="what-sypher-is" title="What Sypher News actually is" revealIndex={0}>
        <p>
          Every article on this site breaks a story into three layers: the shared factual core, the framing
          differences between outlets, and the perspectives that were left out. I publish the supporting research so
          readers can inspect how each piece was built.
        </p>
      </RichSection>

      <RichSection id="who-runs" title="Who runs Sypher News" revealIndex={1}>
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
          <a href="mailto:editor@sypher-news.com" className={infoLinkMagenta}>
            editor@sypher-news.com
          </a>
        </p>
      </RichSection>

      <RichSection id="how-produced" title="How the analysis is produced" revealIndex={2}>
        <p>
          Sypher News uses an AI-assisted research pipeline to gather sources, cluster claims, and map coverage
          differences. The goal is not to replace editorial judgment, but to make the research process faster and more
          consistent.
        </p>
        <p>
          Every article passes through structured stages and then a final editorial review before publication. A longer
          description lives on the{" "}
          <a href="/methodology" className={infoLinkMagenta}>
            methodology page
          </a>
          .
        </p>
      </RichSection>

      <RichSection id="what-you-wont-find" title="What you won't find here" revealIndex={3}>
        <AboutAntiPatternGrid />
        <p>
          Clickbait. Empty outrage. Rewritten wire copy with no extra value. The aim here is straightforward: reduce
          noise, expose framing choices, and give readers a cleaner signal than typical mainstream coverage.
        </p>
      </RichSection>

      <RichSection id="independence" title="Editorial independence and funding" revealIndex={4}>
        <p>
          Sypher News is an independent project. Revenue and monetization never determine coverage decisions, and no
          external commercial partner directs editorial output.
        </p>
      </RichSection>
    </RichInfoPage>
  );
}
