import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-none border border-border/80 bg-transparent px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground", className)}
      {...props}
    />
  );
}
