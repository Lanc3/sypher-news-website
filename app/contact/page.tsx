import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Sypher News for story tips, corrections, partnerships, or newsroom questions.",
};

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="Reach the desk"
      intro="Use this page for editorial questions, correction requests, partnerships, and story tips."
    >
      <InfoSection title="Editorial">
        <p>Email <a className="text-[#00e8ff] underline decoration-[#00e8ff]/40 underline-offset-4" href="mailto:editor@sypher.news">editor@sypher.news</a> for reporting questions, source notes, or correction requests.</p>
      </InfoSection>
      <InfoSection title="Partnerships">
        <p>Email <a className="text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-4" href="mailto:partners@sypher.news">partners@sypher.news</a> for advertising, sponsorship, or distribution discussions.</p>
      </InfoSection>
      <InfoSection title="Tips">
        <p>When sharing a tip, include links, timestamps, source material, and any framing concerns you believe deserve closer review.</p>
      </InfoSection>
    </InfoPage>
  );
}
