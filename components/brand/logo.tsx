import { cn } from "@/lib/utils";
import Image from "next/image";

export function LaunchPixLogo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[4px] border border-border/80 bg-background shadow-none",
          markClassName
        )}
      >
        <Image src="/assets/talocode-logo.svg" alt="" aria-hidden="true" fill className="object-contain p-[3px]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-tight tracking-[-0.03em] text-foreground">Talocode LaunchPix</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Launch API</span>
      </span>
    </span>
  );
}
