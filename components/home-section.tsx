import type { ReactNode } from "react";

export function HomeSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#bc13fe] sm:text-xs">{eyebrow}</p> : null}
          <h2 className="mt-1 font-mono text-lg font-semibold tracking-wide text-[#e8e8e8] sm:text-xl">{title}</h2>
        </div>
        {description ? <p className="max-w-xl text-xs leading-relaxed text-[#666] sm:text-sm">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
