import Link from "next/link";
import { SiteContainer } from "@/components/site-container";

export const metadata = {
  title: "Unsubscribe",
};

export default function UnsubscribePage() {
  return (
    <main className="flex-1 py-12 sm:py-16">
      <SiteContainer max="sm">
        <div className="panel px-5 py-8 sm:px-8 sm:py-10">
          <h1 className="font-mono text-xl font-bold text-[#00e8ff] sm:text-2xl">Unsubscribe</h1>
          <p className="mt-4 text-sm leading-relaxed text-[#a8a8a8] sm:text-base">
            ESP-backed unsubscribe is not wired yet. Contact the operator with the email you used to subscribe, or ignore
            future messages once delivery is connected.
          </p>
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
