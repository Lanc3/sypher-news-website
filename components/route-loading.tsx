import { SiteContainer } from "@/components/site-container";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

/** Subtle block placeholder; `animate-pulse` is damped by globals `prefers-reduced-motion` */
function Sk({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      style={style}
      className={cn(
        "animate-pulse rounded-md bg-white/[0.06] ring-1 ring-inset ring-[#00e8ff]/10 motion-reduce:animate-none",
        className,
      )}
      aria-hidden
    />
  );
}

function Line({ className, style }: { className?: string; style?: CSSProperties }) {
  return <Sk className={cn("h-3", className)} style={style} />;
}

function CardRow() {
  return (
    <div className="space-y-2">
      <Line className="h-4 w-3/4 max-w-md" />
      <Line className="h-3 w-full max-w-2xl" />
      <Line className="h-3 w-5/6 max-w-xl" />
    </div>
  );
}

export function HomeLoading() {
  return (
    <main id="main-content" className="flex-1 py-10 sm:py-14 lg:py-16" aria-busy>
      <span className="sr-only">Loading</span>
      <SiteContainer max="lg" className="space-y-12 sm:space-y-16 lg:space-y-20">
        <section className="panel px-5 py-10 text-center sm:px-8 sm:py-14">
          <Sk className="mx-auto h-3 w-48" />
          <Sk className="mx-auto mt-5 h-8 w-full max-w-lg" />
          <Sk className="mx-auto mt-3 h-4 w-full max-w-2xl" />
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Sk className="h-11 w-40" />
            <Sk className="h-11 w-36" />
          </div>
          <div className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-[#00e8ff]/15 bg-black/30 p-4">
                <Line className="h-3 w-2/3" />
                <div className="mt-2 space-y-1.5">
                  <Line className="h-2.5 w-full" />
                  <Line className="h-2.5 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <Sk className="h-3 w-24" />
          <Sk className="h-7 w-64 max-w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="panel p-4">
                <CardRow />
              </div>
            ))}
          </div>
        </div>
      </SiteContainer>
    </main>
  );
}

function PanelHeader() {
  return (
    <header className="panel px-5 py-6 sm:px-8 sm:py-8">
      <Sk className="h-2.5 w-16" />
      <Sk className="mt-3 h-8 w-48 max-w-[80%]" />
      <Sk className="mt-3 h-3 w-full max-w-xl" />
    </header>
  );
}

export function NewsIndexLoading() {
  return (
    <main id="main-content" className="flex-1 py-10 sm:py-14" aria-busy>
      <span className="sr-only">Loading</span>
      <SiteContainer max="md">
        <PanelHeader />
        <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="panel panel-glow min-h-[4.5rem] px-4 py-4 sm:px-5 sm:py-5">
              <Line className="h-4 w-2/3" />
              <Line className="mt-2 h-3 w-1/2" />
            </li>
          ))}
        </ul>
      </SiteContainer>
    </main>
  );
}

export function CategoryLoading() {
  return (
    <main id="main-content" className="flex-1 py-10 sm:py-14" aria-busy>
      <span className="sr-only">Loading</span>
      <SiteContainer max="md">
        <PanelHeader />
        <ul className="mt-8 space-y-3 sm:mt-10 sm:space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="panel p-4">
              <CardRow />
            </li>
          ))}
        </ul>
      </SiteContainer>
    </main>
  );
}

export function ArticleLoading() {
  return (
    <main id="main-content" className="flex-1 py-8 sm:py-10 lg:py-12" aria-busy>
      <span className="sr-only">Loading</span>
      <SiteContainer max="lg" className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <article className="min-w-0 flex-1">
          <div className="panel px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="flex flex-wrap gap-2">
              <Sk className="h-2.5 w-32" />
              <Sk className="h-2.5 w-20" />
            </div>
            <Sk className="mt-2 h-3 w-2/3 max-w-sm" />
            <Sk className="mt-4 h-9 w-full max-w-3xl" />
            <div className="mt-4 flex flex-wrap gap-2">
              <Sk className="h-3 w-24" />
              <Sk className="h-3 w-24" />
            </div>
            <div className="mt-8 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Line
                  key={i}
                  className="h-2.5 w-full"
                  style={{ maxWidth: `${90 - (i % 3) * 5}%` }}
                />
              ))}
            </div>
          </div>
        </article>
        <aside className="hidden w-full shrink-0 lg:block lg:max-w-[200px] xl:max-w-[220px]">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Sk key={i} className="h-24 w-full" />
            ))}
          </div>
        </aside>
      </SiteContainer>
    </main>
  );
}

export function GlobalNewsroomLoading() {
  return (
    <main id="main-content" className="flex-1 py-8 sm:py-10 lg:py-12" aria-busy>
      <span className="sr-only">Loading</span>
      <SiteContainer max="lg">
        <div className="space-y-6">
          <header className="panel px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex items-center gap-2">
              <Sk className="h-5 w-5" />
              <Sk className="h-7 w-48" />
            </div>
            <Sk className="mt-2 h-3 w-full max-w-lg" />
          </header>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
            <div className="min-w-0 flex-1">
              <div className="panel overflow-hidden p-2 sm:p-4">
                <div className="mx-auto flex aspect-square max-w-[520px] items-center justify-center">
                  <div className="h-full w-full max-w-[480px] rounded-full bg-gradient-to-b from-white/[0.04] to-transparent ring-1 ring-[#00e8ff]/15" />
                </div>
              </div>
            </div>
            <div className="panel h-[360px] w-full overflow-hidden lg:h-[520px] lg:w-[260px] lg:shrink-0">
              <div className="space-y-2 p-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Sk key={i} className="h-7 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </SiteContainer>
    </main>
  );
}

export function FeedLoading() {
  return (
    <main id="main-content" className="flex-1 py-8 sm:py-10 lg:py-12" aria-busy>
      <span className="sr-only">Loading</span>
      <SiteContainer max="md">
        <div className="space-y-6">
          <div className="panel p-5 sm:p-6">
            <Line className="h-3 w-40" />
            <Sk className="mt-2 h-8 w-64 max-w-full" />
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Sk key={i} className="h-8 w-20 rounded-md" />
              ))}
            </div>
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="panel p-4">
              <CardRow />
            </div>
          ))}
        </div>
      </SiteContainer>
    </main>
  );
}

/** Generic page shell for static-ish routes (about, terms, etc.) */
export function GenericPageLoading() {
  return (
    <main id="main-content" className="flex-1 py-10 sm:py-12 lg:py-14" aria-busy>
      <span className="sr-only">Loading</span>
      <SiteContainer max="md">
        <div className="panel px-5 py-8 sm:px-8 sm:py-10">
          <Sk className="h-2.5 w-24" />
          <Sk className="mt-4 h-7 w-3/4 max-w-md" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Line key={i} className="h-2.5 w-full" style={{ maxWidth: `${100 - (i % 2) * 8}%` }} />
            ))}
          </div>
        </div>
      </SiteContainer>
    </main>
  );
}
