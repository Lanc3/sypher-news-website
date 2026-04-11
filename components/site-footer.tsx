import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { SiteContainer } from "@/components/site-container";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#00ff41]/20 bg-black/55 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 sm:pt-14">
      <SiteContainer>
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="font-mono text-sm font-semibold tracking-wide text-[#00ff41]">Sypher News</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#a8a8a8] sm:text-[0.9375rem]">
              Disassembling mainstream narratives with transparent, data-driven reporting.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#00ff41]/75">Newsletter</p>
            <NewsletterForm />
            <p className="mt-3 text-xs leading-relaxed text-[#666] sm:mt-4">
              By subscribing you acknowledge our processing of your email for updates.{" "}
              <Link href="/unsubscribe" className="text-[#ff2bd6] underline-offset-2 hover:underline">
                Unsubscribe
              </Link>
            </p>
          </div>
        </div>
        <p className="mt-10 border-t border-[#1a1a1a] pt-6 text-center text-xs text-[#555] sm:mt-12">
          © {new Date().getFullYear()} Sypher News
        </p>
      </SiteContainer>
    </footer>
  );
}
