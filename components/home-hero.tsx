import Link from "next/link";
import { HomeHeroGlobe } from "@/components/home-hero-globe";

export function HomeHero({ countryArticleCounts }: { countryArticleCounts: Record<string, number> }) {
  return (
    <section className="panel px-5 py-10 text-center sm:px-8 sm:py-14">
      <HomeHeroGlobe countryArticleCounts={countryArticleCounts} />
      <p className="text-magenta-glow font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-[#bc13fe] sm:text-xs">
        Media analysis, not another news site
      </p>
      <h1 className="text-neon-glow mt-4 font-mono text-[1.65rem] font-bold leading-tight tracking-tight text-[#00e8ff] sm:text-4xl lg:text-5xl">
        The news you read has already been framed. We show you how.
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#a8a8a8] sm:text-base">
        Sypher News disassembles mainstream coverage into verified facts and competing frames. For every story, we
        compare how each outlet reported it, flag what got left out, and name whose voices are missing. Reuters has
        the recap — we have the x-ray.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
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

      <div className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "How sources framed it",
            body: "Side-by-side framing comparison for every story — the word choices, the emphasis, the passive voice that obscures agency.",
          },
          {
            title: "Whose voice is missing",
            body: "For every article, we name 2–3 stakeholders the coverage didn't reach, and explain which questions can't be answered without them.",
          },
          {
            title: "Claim-by-claim sourcing",
            body: "Every factual claim tagged VERIFIED / PARTIALLY VERIFIED / SINGLE SOURCE and linked to its supporting URLs.",
          },
          {
            title: "Full research trail",
            body: "The raw research dossier behind every article is published alongside it.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="panel rounded-lg border border-[#00e8ff]/15 bg-black/40 px-4 py-5 sm:px-5 sm:py-6"
          >
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#00e8ff]/80">
              {card.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#9a9a9a]">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
