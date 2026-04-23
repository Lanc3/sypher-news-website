import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Sypher News exists, who runs it, and how the analysis is produced. We are a small, independent media-analysis publication — not another news aggregator.",
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="Why this site exists, and who is behind it"
      intro="Sypher News is a small, independent media-analysis publication. We do not compete with Reuters, the AP, or CoinTelegraph on being first with the news — they are better resourced and closer to the source than we will ever be. What we do instead is read across those outlets after they publish and answer a different question: how did each of them choose to tell this story?"
    >
      <InfoSection title="What Sypher News actually is">
        <p>
          Every article on this site disassembles a recent news event into three layers: the factual core that most
          outlets agree on, the framing differences between the outlets that covered it, and the stakeholder
          perspectives the coverage omitted. We publish the research dossier alongside every article so readers can
          check our work.
        </p>
      </InfoSection>

      <InfoSection title="Who runs Sypher News">
        <p>
          Sypher News is written and edited by <strong>Aaron Keating</strong>, an independent business owner and
          critical reader based in Carlow, Ireland. Aaron is not a career journalist; he is a long-time consumer of
          news who became frustrated with how the same story would read like three different events depending on which
          outlet he opened first. Sypher News is the project that grew out of that frustration.
        </p>
        <p>
          Editorial decisions — what to cover, which framings to surface, which voices to call missing — are made by
          Aaron. The site does not take advertising from political campaigns, crypto tokens, or AI companies that we
          cover. When we are wrong, corrections appear inline with the original article, dated and signed.
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
          Sypher News uses a local AI research pipeline to do the heavy lifting of gathering, clustering, and
          extracting claims from dozens of sources per story. The pipeline runs a locally hosted open-weight model on
          hardware Aaron owns — no third-party API sees the research stream, and no outside party influences which
          angles get surfaced.
        </p>
        <p>
          Every article passes through four automated stages (researcher, analyst, writer, critic) and then a human
          editorial check before it is published. A longer description lives on the{" "}
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
          Breaking news — by the time we publish, the wires have already moved. Opinion columns — we surface framings
          and omissions, we do not tell readers which side is right. Partisan takedowns — we critique coverage, not
          the politics underneath it. Scraped wire copy with a new headline.
        </p>
      </InfoSection>

      <InfoSection title="Editorial independence and funding">
        <p>
          Sypher News is a solo project, funded out of pocket and, eventually, by display advertising served by
          Google AdSense. Advertisers have no influence over editorial content; ad placement is programmatic and Aaron
          does not see individual advertiser identities before or during publication.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
