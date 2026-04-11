import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#00ff41]/20 bg-black/50 px-4 py-10 text-sm text-[#a0a0a0]">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <div>
          <p className="font-mono text-[#00ff41]">Sypher News</p>
          <p className="mt-2 max-w-md leading-relaxed">
            Disassembling mainstream narratives with transparent, data-driven reporting.
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#00ff41]/70">Newsletter</p>
          <NewsletterForm />
          <p className="mt-2 text-xs text-[#666]">
            By subscribing you acknowledge our processing of your email for updates.{" "}
            <Link href="/unsubscribe" className="text-[#ff2bd6] hover:underline">
              Unsubscribe
            </Link>
          </p>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-[#555]">© {new Date().getFullYear()} Sypher News</p>
    </footer>
  );
}
