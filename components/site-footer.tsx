import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { SiteContainer } from "@/components/site-container";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/corrections", label: "Corrections" },
  { href: "/contact", label: "Contact" },
  { href: "/editorial-standards", label: "Editorial standards" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#00e8ff]/20 bg-black/55 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 sm:pt-14">
      <SiteContainer>
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-[1fr_1.1fr_0.9fr]">
          <div>
            <p className="font-mono text-sm font-semibold tracking-wide text-[#00e8ff]">Sypher News</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#a8a8a8] sm:text-[0.9375rem]">
              Media analysis, not another news site. We disassemble mainstream coverage to surface the facts, the frames, and the voices that got left out.
            </p>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-[#666]">
              Sypher News publishes media analysis. Facts cited in our articles are sourced from external outlets; disputes with the original reporting should be directed to those outlets.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#00e8ff]/75">Newsletter</p>
            <NewsletterForm />
            <p className="mt-3 text-xs leading-relaxed text-[#666] sm:mt-4">
              By subscribing you acknowledge our processing of your email for updates.{" "}
              <Link href="/unsubscribe" className="text-[#bc13fe] underline-offset-2 hover:underline">
                Unsubscribe
              </Link>
            </p>
          </div>
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#00e8ff]/75">Info</p>
            <ul className="mt-3 grid gap-2 text-sm text-[#a8a8a8]">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-[#00e8ff]">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin/login" className="transition hover:text-[#bc13fe]">
                  Admin login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-[#1a1a1a] pt-6 text-center text-xs text-[#555] sm:mt-12">
          © 2025–{new Date().getFullYear()} Sypher News. Published by Aaron Keating.
        </p>
      </SiteContainer>
    </footer>
  );
}
