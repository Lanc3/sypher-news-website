import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for accessing and using Sypher News.",
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="Terms of use"
      intro="By using Sypher News, you agree to use the site lawfully, respect intellectual property, and avoid attempts to abuse or interfere with the platform."
    >
      <InfoSection title="Use of content">
        <p>Content is provided for informational purposes. You may link to reporting and quote it with attribution, but full republication or automated scraping may be restricted.</p>
      </InfoSection>
      <InfoSection title="Acceptable use">
        <p>You may not attempt to bypass authentication, overload the platform, tamper with analytics or ads, or abuse ingestion and admin routes.</p>
      </InfoSection>
      <InfoSection title="No warranty">
        <p>We aim for accurate, transparent reporting, but the service is provided as-is and may change as the newsroom and platform evolve.</p>
      </InfoSection>
    </InfoPage>
  );
}
