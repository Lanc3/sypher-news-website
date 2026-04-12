import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for Sypher News readers, newsletter subscribers, and analytics collection.",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="Privacy policy"
      intro="Sypher News keeps privacy expectations straightforward: collect as little as practical, explain what is stored, and make unsubscribe and opt-out paths visible."
    >
      <InfoSection title="What we collect">
        <p>We may collect newsletter email addresses, limited page analytics, search interactions, and ad interaction telemetry needed to operate the product.</p>
      </InfoSection>
      <InfoSection title="Why we collect it">
        <p>We use this information to deliver newsletter updates, understand which reporting helps readers most, protect the site from abuse, and measure monetization performance.</p>
      </InfoSection>
      <InfoSection title="Your controls">
        <p>You can unsubscribe from newsletters through the unsubscribe link included in each email. Browser-level controls, content blockers, and privacy tools may also limit analytics or advertising behavior.</p>
      </InfoSection>
    </InfoPage>
  );
}
