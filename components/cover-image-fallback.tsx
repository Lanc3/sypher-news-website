/**
 * Themed fallback shown in place of a cover image when no image was supplied.
 * Renders a neon-gradient card stamped with the category and headline so the
 * article never appears as a blank placeholder.
 */
type Props = {
  title: string;
  categoryName?: string | null;
  variant?: "hero" | "card";
};

function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

export function CoverImageFallback({ title, categoryName, variant = "card" }: Props) {
  const hue = hashHue(`${categoryName ?? ""}::${title}`);
  const bg = `linear-gradient(135deg, hsl(${hue} 80% 18%) 0%, hsl(${(hue + 40) % 360} 70% 8%) 60%, #060810 100%)`;
  const isHero = variant === "hero";
  return (
    <div
      role="img"
      aria-label={`Sypher News · ${categoryName ?? "Article"} · ${title}`}
      className={
        isHero
          ? "relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-[#00e8ff]/20"
          : "relative aspect-[16/9] w-full overflow-hidden rounded-t-lg border-b border-[#00e8ff]/15"
      }
      style={{ backgroundImage: bg }}
    >
      <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_30%_20%,rgba(0,232,255,0.25),transparent_60%),radial-gradient(circle_at_75%_80%,rgba(188,19,254,0.22),transparent_55%)]" />
      <div className="relative flex h-full w-full flex-col justify-between p-4 sm:p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bc13fe] sm:text-xs">
          {categoryName ?? "Sypher News"}
        </div>
        <div
          className={
            isHero
              ? "font-mono text-base font-semibold leading-tight text-[#e8e8e8] sm:text-lg lg:text-xl"
              : "line-clamp-3 font-mono text-xs font-semibold leading-tight text-[#e8e8e8] sm:text-sm"
          }
        >
          {title}
        </div>
        <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#666] sm:text-[10px]">
          sypher.news · transparency stack
        </div>
      </div>
    </div>
  );
}
