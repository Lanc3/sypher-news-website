import { SiteContainer } from "@/components/site-container";
import { RichInfoTOC, type RichTocItem } from "@/components/rich-info-toc";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export const infoLinkMagenta =
  "text-[#bc13fe] underline decoration-[#bc13fe]/40 underline-offset-4 hover:decoration-[#bc13fe]";
export const infoLinkCyan =
  "text-[#00e8ff] underline decoration-[#00e8ff]/40 underline-offset-4 hover:decoration-[#00e8ff]";

export function RichInfoPage({
  eyebrow,
  title,
  intro,
  heroVisual,
  tocItems,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  heroVisual: ReactNode;
  tocItems: RichTocItem[];
  children: ReactNode;
}) {
  const showToc = tocItems.length > 0;

  return (
    <main id="main-content" className="relative z-[1] flex-1 py-10 sm:py-14">
      <SiteContainer max="lg">
        <header className="panel panel-glow relative overflow-hidden px-5 py-8 sm:px-8 sm:py-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            aria-hidden
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(0,232,255,0.04) 1px, transparent 1px),
                linear-gradient(rgba(0,232,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_minmax(0,320px)] lg:items-center">
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-[var(--neon-pink)] sm:text-xs">
                {eyebrow}
              </p>
              <h1 className="mt-3 font-mono text-2xl font-bold tracking-tight text-[var(--neon)] text-neon-glow sm:text-3xl lg:text-4xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b0b0b0] sm:text-base">{intro}</p>
            </div>
            <div className="relative min-w-0 lg:justify-self-end">{heroVisual}</div>
          </div>
        </header>
      </SiteContainer>

      <SiteContainer max="lg" className="mt-10 sm:mt-12">
        <div className={cn("flex flex-col gap-10", showToc && "lg:flex-row lg:items-start lg:gap-12")}>
          {showToc ? (
            <aside className="hidden shrink-0 lg:block lg:w-[200px]">
              <div className="sticky top-24">
                <RichInfoTOC items={tocItems} />
              </div>
            </aside>
          ) : null}
          <div className={cn("min-w-0 flex-1 space-y-12 sm:space-y-14")}>{children}</div>
        </div>
      </SiteContainer>
    </main>
  );
}

export function RichSection({
  id,
  title,
  kicker,
  icon: Icon,
  revealIndex = 0,
  children,
}: {
  id: string;
  title: string;
  kicker?: string;
  icon?: LucideIcon;
  revealIndex?: number;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      style={{ animationDelay: `${revealIndex * 70}ms` }}
      className={cn(
        "rich-reveal scroll-mt-24 border-l border-[rgba(var(--neon-rgb),0.22)] pl-5 sm:pl-6",
        "shadow-[inset_3px_0_0_0_rgba(var(--neon-rgb),0.08)]",
      )}
    >
      {Icon || kicker ? (
        <div className="flex flex-wrap items-center gap-2">
          {Icon ? (
            <span className="flex h-8 w-8 items-center justify-center rounded border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--neon)]">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          ) : null}
          {kicker ? (
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--neon-pink)]/90">
              {kicker}
            </p>
          ) : null}
        </div>
      ) : null}
      <h2 className={cn("font-mono text-sm font-semibold uppercase tracking-[0.2em] text-[var(--neon)]/85", Icon || kicker ? "mt-2" : "mt-0")}>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-[#b8b8b8] sm:text-base">{children}</div>
    </section>
  );
}
