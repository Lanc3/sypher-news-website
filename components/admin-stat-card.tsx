import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminStatCard({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[#666]">{label}</p>
        <CardTitle className="text-3xl text-[#bc13fe]">{value}</CardTitle>
      </CardHeader>
      {hint || children ? (
        <CardContent className="space-y-3">
          {hint ? <p className="text-sm text-[#888]">{hint}</p> : null}
          {children}
        </CardContent>
      ) : null}
    </Card>
  );
}
