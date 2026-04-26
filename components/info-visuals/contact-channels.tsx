"use client";

import { cn } from "@/lib/utils";
import { Check, Copy, Handshake, Mail, ShieldAlert } from "lucide-react";
import { useCallback, useState } from "react";

const channels = [
  {
    title: "Editorial",
    icon: Mail,
    body: "For reporting questions, source notes, or correction requests.",
    email: "editor@sypher.news",
    linkClass: "text-[#00e8ff] underline decoration-[#00e8ff]/40 underline-offset-4 hover:decoration-[#00e8ff]",
  },
  {
    title: "Partnerships",
    icon: Handshake,
    body: "For advertising, sponsorship, or distribution discussions.",
    email: "partners@sypher.news",
    linkClass: "text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-4 hover:decoration-[#bc13fe]",
  },
  {
    title: "Tips",
    icon: ShieldAlert,
    body: "When sharing a tip, include links, timestamps, source material, and any framing concerns you believe deserve closer review.",
    email: null as string | null,
    linkClass: "",
  },
] as const;

function CopyEmailButton({ email, linkClass }: { email: string; linkClass: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    void navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }, [email]);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <a href={`mailto:${email}`} className={linkClass}>
        {email}
      </a>
      <button
        type="button"
        onClick={onCopy}
        className={cn(
          "inline-flex items-center gap-1 rounded border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--neon)] transition-colors hover:border-[var(--neon)]/50",
        )}
        aria-label={`Copy ${email} to clipboard`}
      >
        {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function ContactChannels() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {channels.map((ch) => {
        const Icon = ch.icon;
        return (
          <div key={ch.title} className="panel panel-glow flex flex-col p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded border border-[var(--border-subtle)] text-[var(--neon)]">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#d0d4dc]">{ch.title}</h3>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-[#b0b0b0]">{ch.body}</p>
            {ch.email ? <CopyEmailButton email={ch.email} linkClass={ch.linkClass} /> : null}
          </div>
        );
      })}
    </div>
  );
}
