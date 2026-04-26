import type { Metadata } from "next";
import { ContactChannels } from "@/components/info-visuals/contact-channels";
import { RichInfoPage } from "@/components/rich-info-page";
import { Handshake, Mail, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Sypher News for story tips, corrections, partnerships, or newsroom questions.",
};

export default function ContactPage() {
  return (
    <RichInfoPage
      eyebrow="Contact"
      title="Reach the desk"
      intro="Use this page for editorial questions, correction requests, partnerships, and story tips."
      heroVisual={
        <div className="panel mx-auto flex max-w-[280px] items-center justify-center gap-6 px-6 py-8 sm:mx-0" aria-hidden>
          <Mail className="h-10 w-10 text-[var(--neon)]/55 drop-shadow-[0_0_12px_rgba(var(--neon-rgb),0.35)]" />
          <Handshake className="h-10 w-10 text-[var(--neon-pink)]/55 drop-shadow-[0_0_12px_rgba(var(--neon-pink-rgb),0.3)]" />
          <ShieldAlert className="h-10 w-10 text-[var(--neon)]/45" />
        </div>
      }
      tocItems={[]}
    >
      <div className="rich-reveal" style={{ animationDelay: "0ms" }}>
        <ContactChannels />
      </div>
    </RichInfoPage>
  );
}
