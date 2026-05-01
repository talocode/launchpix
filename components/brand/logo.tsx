import { cn } from "@/lib/utils";

export function LaunchPixLogo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3.5", className)}>
      <span
        className={cn(
          "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_18px_42px_-30px_rgba(15,23,42,0.55)] dark:border-white/[0.1] dark:bg-[#050810] dark:shadow-[0_18px_42px_-30px_rgba(0,0,0,0.9)]",
          markClassName
        )}
      >
        <svg viewBox="0 0 40 40" aria-hidden="true" className="size-9">
          <defs>
            <linearGradient id="launchpix-mark-a" x1="9" y1="7" x2="30" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#111827" />
              <stop offset="1" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="launchpix-mark-b" x1="12" y1="28" x2="31" y2="9" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22D3EE" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
            <filter id="launchpix-mark-shadow" x="4" y="4" width="32" height="32" colorInterpolationFilters="sRGB">
              <feDropShadow dx="0" dy="7" stdDeviation="4" floodColor="#020617" floodOpacity="0.22" />
            </filter>
          </defs>
          <rect x="5" y="5" width="30" height="30" rx="10" fill="url(#launchpix-mark-a)" />
          <g filter="url(#launchpix-mark-shadow)">
            <path d="M12 10.8c0-.66.54-1.2 1.2-1.2h3.9c.66 0 1.2.54 1.2 1.2v16.4h9.5c.66 0 1.2.54 1.2 1.2v1.2c0 .66-.54 1.2-1.2 1.2H13.2c-.66 0-1.2-.54-1.2-1.2V10.8Z" fill="#F8FAFC" />
            <path d="M20.8 9.6h6.1c4.05 0 6.7 2.38 6.7 6.05 0 3.72-2.65 6.18-6.7 6.18h-2.6v7.77c0 .66-.54 1.2-1.2 1.2h-2.3V9.6Zm5.7 8.85c1.62 0 2.62-1.02 2.62-2.65 0-1.62-1-2.6-2.62-2.6h-2.2v5.25h2.2Z" fill="url(#launchpix-mark-b)" />
          </g>
          <path d="M30.2 7.7l.72 2.04 2.08.7-2.08.72-.72 2.04-.74-2.04-2.06-.72 2.06-.7.74-2.04Z" fill="#67E8F9" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] font-semibold leading-tight tracking-[-0.02em] text-slate-950 dark:text-white">LaunchPix</span>
        <span className="block text-[11px] font-medium tracking-[0.01em] text-slate-500">Launch asset studio</span>
      </span>
    </span>
  );
}
