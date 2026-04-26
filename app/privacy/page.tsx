import type { Metadata } from "next";
import { DataFlowHero } from "@/components/info-visuals/data-flow";
import { RichInfoPage, RichSection } from "@/components/rich-info-page";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for Sypher News readers, newsletter subscribers, and analytics collection.",
};

const tocItems = [
  { id: "what-we-collect", label: "What we collect" },
  { id: "why-we-collect", label: "Why we collect" },
  { id: "your-controls", label: "Your controls" },
];

export default function PrivacyPage() {
  return (
    <RichInfoPage
      eyebrow="Privacy"
      title="Privacy policy"
      intro="Sypher News keeps privacy expectations straightforward: collect as little as practical, explain what is stored, and make unsubscribe and opt-out paths visible."
      heroVisual={<DataFlowHero />}
      tocItems={tocItems}
    >
      <RichSection id="what-we-collect" title="What we collect" revealIndex={0}>
        <p>
          We may collect newsletter email addresses, limited page analytics, search interactions, and ad interaction
          telemetry needed to operate the product.
        </p>
      </RichSection>
      <RichSection id="why-we-collect" title="Why we collect it" revealIndex={1}>
        <p>
          We use this information to deliver newsletter updates, understand which reporting helps readers most, protect
          the site from abuse, and measure monetization performance.
        </p>
      </RichSection>
      <RichSection id="your-controls" title="Your controls" revealIndex={2}>
        <p>
          You can unsubscribe from newsletters through the unsubscribe link included in each email. Browser-level
          controls, content blockers, and privacy tools may also limit analytics or advertising behavior.
        </p>
      </RichSection>
    </RichInfoPage>
  );
}
