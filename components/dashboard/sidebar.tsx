"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ChevronUp, Code2, CreditCard, Folder, Gem, Home, ImageIcon, LogOut, Menu, Plus, Settings, UserCircle, Wand2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LaunchPixLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home, section: "overview" },
  { href: "/dashboard/api", label: "API Platform", icon: Code2, section: "api-platform" },
  { href: "/dashboard/projects", label: "Projects", icon: Folder, section: "projects" },
  { href: "/dashboard/projects/new?step=3", label: "Generations", icon: Wand2, section: "generations" },
  { href: "/dashboard/projects", label: "Assets", icon: ImageIcon, section: "assets" },
  { href: "/settings/billing", label: "Billing", icon: CreditCard, section: "billing" },
  { href: "/settings", label: "Settings", icon: Settings, section: "settings" }
] as const;

function getInitials(email: string) {
  const alias = email.split("@")[0] || "launchpix";
  const parts = alias.replace(/[._-]+/g, " ").split(" ").filter(Boolean);
  if (parts.length === 0) return "LP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function isActive(pathname: string, section: (typeof navItems)[number]["section"]) {
  if (section === "overview") return pathname === "/dashboard";
  if (section === "api-platform") return pathname.startsWith("/dashboard/api");
  if (section === "projects") return pathname.startsWith("/dashboard/projects") && !pathname.includes("/dashboard/projects/new") && !pathname.endsWith("/assets") && !pathname.endsWith("/generate");
  if (section === "generations") return pathname.endsWith("/generate") || pathname.includes("/dashboard/projects/new");
  if (section === "assets") return pathname.endsWith("/assets");
  if (section === "billing") return pathname.startsWith("/settings/billing");
  if (section === "settings") return pathname === "/settings";
  return false;
}

function Brand() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3 rounded-[4px] border border-border/80 bg-transparent px-3 py-3 outline-none transition-opacity hover:opacity-70 focus-visible:ring-1 focus-visible:ring-foreground/20">
      <LaunchPixLogo />
    </Link>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = isActive(pathname, item.section);

        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex h-11 items-center gap-3 rounded-[4px] px-3 text-[12px] font-medium outline-none transition-opacity focus-visible:ring-1 focus-visible:ring-foreground/20",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            <span className={cn("absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 transition", active ? "bg-background opacity-100" : "bg-transparent opacity-0")} />
            <item.icon className={cn("size-4 shrink-0 transition-opacity", active ? "text-background" : "text-muted-foreground group-hover:text-foreground")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function PlanCard({ credits, planLabel }: { credits: number; planLabel: string }) {
  const maxCredits = Math.max(credits, 300);
  const progress = Math.min(100, Math.round((credits / maxCredits) * 100));

  return (
    <div className="rounded-[4px] border border-border/80 bg-transparent p-3.5 shadow-none">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-[4px] border border-border/80 bg-transparent">
            <Gem className="size-4 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{planLabel}</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Credits left</p>
          </div>
        </div>
        <p className="text-[10px] font-medium text-muted-foreground">
          {credits} / {maxCredits}
        </p>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-none bg-muted">
        <div className="h-full rounded-none bg-foreground" style={{ width: `${progress}%` }} />
      </div>

      <Link
        href="/settings/billing"
        className="mt-3 flex h-9 items-center justify-center rounded-[4px] bg-foreground text-[10px] font-semibold uppercase tracking-[0.16em] text-background transition-opacity hover:opacity-85"
      >
        Buy credits
      </Link>
    </div>
  );
}

const accountActions = [
  { href: "/settings", label: "Account settings", icon: UserCircle },
  { href: "/settings/billing", label: "Billing and credits", icon: CreditCard },
  { href: "/dashboard/projects/new", label: "New project", icon: Plus },
  { href: "/auth/signout", label: "Sign out", icon: LogOut }
] as const;

function AccountMenu({
  userEmail,
  onNavigate,
  variant = "desktop"
}: {
  userEmail: string;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group/account relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Open account menu"
        className="flex w-full items-center gap-3 rounded-[4px] border border-border/80 bg-transparent p-2.5 text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-1 focus-visible:ring-foreground/20"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[4px] bg-foreground text-xs font-semibold text-background">
          {getInitials(userEmail)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{userEmail.split("@")[0]}</span>
          <span className="block truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{userEmail}</span>
        </span>
        <ChevronUp className={cn("size-4 shrink-0 text-muted-foreground transition group-hover/account:text-foreground", open && "rotate-180 text-foreground")} />
      </button>

      <div
        className={cn(
          "z-50 rounded-[4px] border border-border/80 bg-background p-1.5 shadow-none backdrop-blur-2xl",
          variant === "desktop"
            ? "absolute bottom-[calc(100%+10px)] left-0 right-0 hidden group-hover/account:block group-focus-within/account:block"
            : "mt-2",
          variant === "mobile" && !open && "hidden",
          variant === "desktop" && open && "block"
        )}
      >
        <div className="border-b border-border/80 px-2.5 py-2">
          <p className="truncate text-xs font-medium text-foreground">{userEmail}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Workspace account</p>
        </div>

        <div className="mt-1 space-y-0.5">
          {accountActions.map((action) => {
            const className = cn(
              "flex h-9 w-full items-center gap-2.5 rounded-[4px] px-2.5 text-left text-xs font-medium outline-none transition-opacity focus-visible:ring-1 focus-visible:ring-foreground/20",
              action.href === "/auth/signout"
                ? "text-foreground hover:bg-muted/70"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            );

            if (action.href === "/auth/signout") {
              return (
                <button
                  key={action.href}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                    signOut({ callbackUrl: "/login" });
                  }}
                  className={className}
                >
                  <action.icon className="size-4 shrink-0" />
                  <span>{action.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={className}
              >
                <action.icon className="size-4 shrink-0" />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar({
  credits,
  planLabel,
  userEmail
}: {
  credits: number;
  planLabel: string;
  userEmail: string;
}) {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-border/80 bg-background px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Brand />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            className="grid size-10 place-items-center rounded-[4px] border border-border/80 bg-transparent text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" aria-label="Mobile navigation">
          <button
            type="button"
            aria-label="Close navigation backdrop"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="absolute inset-x-3 top-20 max-h-[calc(100svh-5.75rem)] overflow-y-auto rounded-[4px] border border-border/80 bg-background p-3 shadow-none">
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr]">
              <PlanCard credits={credits} planLabel={planLabel} />
              <AccountMenu userEmail={userEmail} variant="mobile" onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}

      <aside className="hidden w-[228px] shrink-0 border-r border-border/80 bg-background lg:block xl:w-[236px]">
        <div className="sticky top-0 flex h-screen min-h-0 flex-col px-3 py-4">
          <Brand />

          <div className="mt-7 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(163,163,163,0.45)_transparent]">
            <NavLinks pathname={pathname} />
          </div>

          <div className="mt-4 space-y-3">
            <PlanCard credits={credits} planLabel={planLabel} />
            <AccountMenu userEmail={userEmail} />
          </div>
        </div>
      </aside>
    </>
  );
}
