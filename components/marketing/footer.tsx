import Link from "next/link";
import { LaunchPixLogo } from "@/components/brand/logo";

const links = [
  { href: "/about" as const, label: "About" },
  { href: "/pricing" as const, label: "Credits" },
  { href: "/docs/api" as const, label: "API Docs" },
  { href: "/contact" as const, label: "Contact" },
  { href: "/privacy" as const, label: "Privacy" },
  { href: "/terms" as const, label: "Terms" }
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="app-shell py-10 sm:py-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Link href="/" className="rounded-[4px] outline-none transition-opacity hover:opacity-80 focus-visible:ring-1 focus-visible:ring-foreground/20">
            <LaunchPixLogo className="justify-center" />
          </Link>

          <p className="mt-4 max-w-xl text-balance text-sm leading-7 text-muted-foreground">
            Talocode LaunchPix is an open-source, API-first visual service for app listings, promo tiles, and launch banners.
          </p>

          <nav className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {links.map((item) => (
              <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/80 pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p>Copyright 2026 Talocode. LaunchPix is open source.</p>
          <p>Developer-first launch visuals with key-based API access.</p>
        </div>
      </div>
    </footer>
  );
}
