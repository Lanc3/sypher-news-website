import type { Metadata } from "next";
import { TermsPillars } from "@/components/info-visuals/terms-pillars";
import { RichInfoPage, RichSection } from "@/components/rich-info-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for accessing and using Sypher News.",
};

const tocItems = [
  { id: "use-of-content", label: "Use of content" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "no-warranty", label: "No warranty" },
];

export default function TermsPage() {
  return (
    <RichInfoPage
      eyebrow="Terms"
      title="Terms of use"
      intro="By using Sypher News, you agree to use the site lawfully, respect intellectual property, and avoid attempts to abuse or interfere with the platform."
      heroVisual={<TermsPillars />}
      tocItems={tocItems}
    >
      <RichSection id="use-of-content" title="Use of content" revealIndex={0}>
        <p>
          Content is provided for informational purposes. You may link to reporting and quote it with attribution, but
          full republication or automated scraping may be restricted.
        </p>
      </RichSection>
      <RichSection id="acceptable-use" title="Acceptable use" revealIndex={1}>
        <p>
          You may not attempt to bypass authentication, overload the platform, tamper with analytics or ads, or abuse
          ingestion and admin routes.
        </p>
      </RichSection>
      <RichSection id="no-warranty" title="No warranty" revealIndex={2}>
        <p>
          We aim for accurate, transparent reporting, but the service is provided as-is and may change as the newsroom
          and platform evolve.
        </p>
      </RichSection>
    </RichInfoPage>
  );
}
