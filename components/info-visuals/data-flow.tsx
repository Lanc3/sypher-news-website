import { Check, X } from "lucide-react";

const collect = ["Newsletter emails", "Limited page analytics", "Search interactions", "Ad interaction telemetry"];

const avoid = [
  "Sell subscriber lists to data brokers",
  "Hide what each cookie or tag is for",
  "Block browser privacy tools you choose to use",
];

export function DataFlowHero() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="panel flex flex-col border-[rgba(var(--neon-rgb),0.28)] p-4 sm:p-5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--neon)]">What we collect</p>
        <ul className="mt-3 space-y-2">
          {collect.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-[#b8c0cc] sm:text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--neon)]" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="panel flex flex-col border-[rgba(var(--neon-pink-rgb),0.22)] p-4 sm:p-5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--neon-pink)]">What we don&apos;t do</p>
        <ul className="mt-3 space-y-2">
          {avoid.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-[#b8c0cc] sm:text-sm">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-[var(--neon-pink)]/80" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
