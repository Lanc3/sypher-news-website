import Link from "next/link";
import { HomeHeroGlobe } from "@/components/home-hero-globe";

const features = [
  {
    title: "How sources framed it",
    body: "Side-by-side framing comparison — the word choices, emphasis, and passive voice that obscures agency.",
  },
  {
    title: "Whose voice is missing",
    body: "For every article, 2–3 stakeholders the coverage didn't reach and the questions that can't be answered without them.",
  },
  {
    title: "Claim-by-claim sourcing",
    body: "Every factual claim tagged VERIFIED / PARTIALLY VERIFIED / SINGLE SOURCE and linked to supporting URLs.",
  },
  {
    title: "Full research trail",
    body: "The raw research dossier behind every article is published alongside it.",
  },
];

export function HomeHero({ countryArticleCounts }: { countryArticleCounts: Record<string, number> }) {
  return (
    <section className="panel overflow-hidden">
      <div className="grid lg:grid-cols-[7fr_5fr]">
        {/* Left: headline + CTAs + feature grid */}
        <div className="flex flex-col justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          <p className="text-magenta-glow font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-[#bc13fe] sm:text-xs">
            Media analysis, not another news site
          </p>
          <h1 className="text-neon-glow mt-4 font-mono text-[1.65rem] font-bold leading-tight tracking-tight text-[#00e8ff] sm:text-4xl lg:text-[2.6rem]">
            The news you read has already been framed.{" "}
            <span className="text-[#bc13fe]">We show you how.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#a8a8a8] sm:text-base">
            Sypher News disassembles mainstream coverage into verified facts and competing frames. For every story,
            we compare how each outlet reported it, flag what got left out, and name whose voices are missing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/news"
              className="inline-flex min-h-11 items-center rounded-md border border-[#00e8ff]/60 bg-[#00e8ff]/10 px-5 py-2.5 font-mono text-sm font-medium text-[#00e8ff] transition hover:bg-[#00e8ff]/20"
            >
              Read the latest analyses
            </Link>
            <Link
              href="/methodology"
              className="inline-flex min-h-11 items-center rounded-md border border-[#bc13fe]/50 bg-[#bc13fe]/10 px-5 py-2.5 font-mono text-sm font-medium text-[#bc13fe] transition hover:bg-[#bc13fe]/20"
            >
              How we do it
            </Link>
          </div>

          {/* Feature grid — 2×2 */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {features.map((card) => (
              <div
                key={card.title}
                className="rounded-lg border border-[#00e8ff]/10 bg-black/40 p-3 sm:p-4"
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00e8ff]/80">
                  {card.title}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#9a9a9a]">{card.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: globe — hidden on small, shows on lg */}
        <div className="hidden items-center justify-center border-l border-[#00e8ff]/10 bg-[#060810] lg:flex">
          <HomeHeroGlobe countryArticleCounts={countryArticleCounts} />
        </div>
      </div>

      {/* Globe on mobile — full width below text */}
      <div className="flex items-center justify-center border-t border-[#00e8ff]/10 bg-[#060810] py-6 lg:hidden">
        <HomeHeroGlobe countryArticleCounts={countryArticleCounts} />
      </div>
    </section>
  );
}
