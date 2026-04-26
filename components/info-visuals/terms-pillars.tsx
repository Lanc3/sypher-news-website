import { AlertTriangle, FileText, Scale } from "lucide-react";

const pillars = [
  { title: "Content use", icon: FileText },
  { title: "Acceptable use", icon: Scale },
  { title: "No warranty", icon: AlertTriangle },
] as const;

export function TermsPillars() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {pillars.map((p) => {
        const Icon = p.icon;
        return (
          <div key={p.title} className="panel panel-glow p-4 text-center sm:p-5">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--neon)]">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8dce4]">{p.title}</p>
          </div>
        );
      })}
    </div>
  );
}
