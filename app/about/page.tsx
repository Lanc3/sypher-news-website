import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "About",
  description: "Learn how Sypher News disassembles mainstream coverage to surface sourcing, framing, and bias signals.",
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Mission"
      title="About Sypher News"
      intro="We disassemble mainstream news coverage so you can get the story with less bias, clearer sourcing, and more transparency."
    >
      <InfoSection title="What we do">
        <p>Sypher News is built to break stories apart, not just repeat them. We examine sourcing, framing, transparency, and narrative pressure so readers can judge the story on evidence instead of spin.</p>
      </InfoSection>
      <InfoSection title="How we think">
        <p>Our editorial goal is not to claim perfect neutrality. It is to show our work, surface where bias may exist, and make the reporting chain easier to inspect.</p>
      </InfoSection>
      <InfoSection title="Why it matters">
        <p>Most readers do not need louder headlines. They need clearer context. Sypher News is designed to help you inspect the inputs behind the story before you accept the framing.</p>
      </InfoSection>
    </InfoPage>
  );
}
