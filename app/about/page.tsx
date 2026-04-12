import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";

export const metadata: Metadata = {
  title: "About",
  description: "Learn how Sypher News uses AI-driven deep research to generate global coverage as part of a fully automated news system.",
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Mission"
      title="About Sypher News"
      intro="Sypher News uses AI-driven deep research to generate articles, categories, and topics from current news around the world. Our goal is to build a fully automated news system."
    >
      <InfoSection title="What we do">
        <p>Sypher News is an AI-generated news platform built to monitor current events, conduct deep research, and assemble coverage without relying on a traditional manual newsroom workflow.</p>
      </InfoSection>
      <InfoSection title="How we think">
        <p>Our system is designed to reduce manual bottlenecks and move toward full automation while still surfacing sourcing, framing, and transparency signals that readers can inspect for themselves.</p>
      </InfoSection>
      <InfoSection title="Why it matters">
        <p>The long-term goal is a fully automated news system that can continuously research, organize, and publish global coverage at scale while making the process more transparent than traditional outlets.</p>
      </InfoSection>
    </InfoPage>
  );
}
