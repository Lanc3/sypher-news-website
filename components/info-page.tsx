import type { ReactNode } from "react";
import { SiteContainer } from "@/components/site-container";

export function InfoPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main id="main-content" className="flex-1 py-10 sm:py-14">
      <SiteContainer max="md">
        <section className="panel px-5 py-8 sm:px-8 sm:py-10">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-[#bc13fe] sm:text-xs">{eyebrow}</p>
          <h1 className="mt-3 font-mono text-2xl font-bold tracking-tight text-[#00e8ff] sm:text-3xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b0b0b0] sm:text-base">{intro}</p>
          <div className="mt-8 space-y-6 text-sm leading-7 text-[#d7d7d7] sm:text-base">{children}</div>
        </section>
      </SiteContainer>
    </main>
  );
}

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-[#00e8ff]/80">{title}</h2>
      <div className="mt-3 space-y-3 text-[#b8b8b8]">{children}</div>
    </section>
  );
}
