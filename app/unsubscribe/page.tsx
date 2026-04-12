import Link from "next/link";
import type { Metadata } from "next";
import { SiteContainer } from "@/components/site-container";
import { UnsubscribeForm } from "@/components/unsubscribe-form";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Unsubscribe from Sypher News email updates.",
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams;
  return (
    <main id="main-content" className="flex-1 py-12 sm:py-16">
      <SiteContainer max="sm">
        <div className="panel px-5 py-8 sm:px-8 sm:py-10">
          <h1 className="font-mono text-xl font-bold text-[#00e8ff] sm:text-2xl">Unsubscribe</h1>
          <p className="mt-4 text-sm leading-relaxed text-[#a8a8a8] sm:text-base">
            Manage your Sypher dispatch subscription here. If you opened this from an email link, the unsubscribe token should be prefilled in the URL.
          </p>
          {token ? (
            <UnsubscribeForm token={token} />
          ) : (
            <p className="mt-6 text-sm text-[#888]">
              Missing unsubscribe token. Open the unsubscribe link from your email or contact the operator for help.
            </p>
          )}
          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center font-mono text-sm text-[#bc13fe] underline decoration-[#bc13fe]/50 underline-offset-4 hover:decoration-[#bc13fe]"
          >
            ← Return home
          </Link>
        </div>
      </SiteContainer>
    </main>
  );
}
