import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex min-h-11 w-full rounded border border-[#00e8ff]/30 bg-[#080808] px-3 py-2 text-sm text-[#e0e0e0] shadow-inner shadow-black/30 placeholder:text-[#666] focus-visible:border-[#00e8ff] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00e8ff]",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
