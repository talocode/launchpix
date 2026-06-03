import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LaunchPixLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  { href: "/about" as const, label: "About" },
  { href: "/pricing" as const, label: "Credits" },
  { href: "/contact" as const, label: "Support" }
];

const resourceItems = [
  { href: "/docs/api" as const, label: "API" },
  { href: "/terms" as const, label: "Terms" }
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-xl">
      <div className="app-shell flex min-h-[72px] items-center justify-between gap-4 py-3">
        <Link href="/" className="rounded-[4px] outline-none transition-opacity hover:opacity-80 focus-visible:ring-1 focus-visible:ring-foreground/20">
          <LaunchPixLogo />
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <nav className="hidden items-center gap-6 lg:flex">
            <a href="/#workflow" className="text-sm font-medium text-muted-foreground hover:text-foreground">Workflow</a>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
            {resourceItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard/projects/new">
                <span className="hidden sm:inline">New project</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
