import { cn } from "@/lib/utils";
import Image from "next/image";

export function LaunchPixLogo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3.5", className)}>
      <span
        className={cn(
          "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_18px_42px_-30px_rgba(15,23,42,0.45)] dark:border-white/[0.1] dark:bg-[#050505] dark:shadow-[0_18px_42px_-30px_rgba(0,0,0,0.95)]",
          markClassName
        )}
      >
        <Image src="/assets/talocode-logo.svg" alt="" aria-hidden="true" fill className="object-cover p-1" />
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] font-semibold leading-tight tracking-[-0.02em] text-slate-950 dark:text-white">Talocode LaunchPix</span>
        <span className="block text-[11px] font-medium tracking-[0.01em] text-slate-500">Open-source launch API</span>
      </span>
    </span>
  );
}
