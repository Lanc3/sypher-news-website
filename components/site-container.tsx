import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const maxMap = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-6xl xl:max-w-7xl",
} as const;

type MaxKey = keyof typeof maxMap;

export function SiteContainer({
  children,
  className,
  max = "lg",
}: {
  children: ReactNode;
  className?: string;
  max?: MaxKey;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        maxMap[max],
        className,
      )}
    >
      {children}
    </div>
  );
}
