"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ChevronUp, CreditCard, Folder, Gem, Home, ImageIcon, LogOut, Menu, Plus, Settings, UserCircle, Wand2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LaunchPixLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home, section: "overview" },
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
  if (section === "projects") return pathname.startsWith("/dashboard/projects") && !pathname.includes("/dashboard/projects/new") && !pathname.endsWith("/assets") && !pathname.endsWith("/generate");
  if (section === "generations") return pathname.endsWith("/generate") || pathname.includes("/dashboard/projects/new");
  if (section === "assets") return pathname.endsWith("/assets");
  if (section === "billing") return pathname.startsWith("/settings/billing");
  if (section === "settings") return pathname === "/settings";
  return false;
}

function Brand() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3 rounded-2xl px-2 py-2 outline-none transition focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-white/20">
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
              "group relative flex h-10 items-center gap-3 rounded-2xl px-3 text-[13px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-300/50",
              active
                ? "bg-slate-100 text-slate-950 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)] dark:bg-[#101622] dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-[#0b111c] dark:hover:text-slate-100"
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full transition",
                active ? "bg-slate-900 opacity-100 dark:bg-slate-200" : "bg-transparent opacity-0"
              )}
            />
            <item.icon className={cn("size-4 shrink-0 transition", active ? "text-slate-900 dark:text-slate-100" : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300")} />
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
    <div className="rounded-3xl border border-slate-200 bg-white p-3.5 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#070b12] dark:shadow-[0_24px_70px_-54px_rgba(0,0,0,0.95)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-white/[0.04]">
            <Gem className="size-4 text-slate-300" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{planLabel}</p>
            <p className="text-[11px] text-slate-500">Credits left</p>
          </div>
        </div>
        <p className="text-[11px] font-medium text-slate-400">{credits} / {maxCredits}</p>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-slate-900 dark:bg-slate-300" style={{ width: `${progress}%` }} />
      </div>

      <Link
        href="/settings/billing"
        className="mt-3 flex h-9 items-center justify-center rounded-2xl bg-[#5b5ff7] text-xs font-semibold text-white shadow-[0_16px_40px_-28px_rgba(91,95,247,0.85)] transition hover:bg-[#686cf8]"
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
        className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 text-left outline-none transition hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:border-white/[0.13] dark:hover:bg-white/[0.055] dark:focus-visible:ring-white/20"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white ring-1 ring-slate-200 dark:bg-[#101c32] dark:ring-white/[0.08]">
          {getInitials(userEmail)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-950 dark:text-white">{userEmail.split("@")[0]}</span>
          <span className="block truncate text-[11px] text-slate-500">{userEmail}</span>
        </span>
        <ChevronUp className={cn("size-4 shrink-0 text-slate-500 transition group-hover/account:text-slate-300", open && "rotate-180 text-slate-300")} />
      </button>

      <div
        className={cn(
          "z-50 rounded-2xl border border-slate-200 bg-white/98 p-1.5 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.25)] backdrop-blur-2xl dark:border-white/[0.09] dark:bg-[#081120]/98 dark:shadow-[0_24px_80px_-34px_rgba(0,0,0,0.92)]",
          variant === "desktop"
            ? "absolute bottom-[calc(100%+10px)] left-0 right-0 hidden group-hover/account:block group-focus-within/account:block"
            : "mt-2",
          variant === "mobile" && !open && "hidden",
          variant === "desktop" && open && "block"
        )}
      >
        <div className="border-b border-white/[0.07] px-2.5 py-2">
          <p className="truncate text-xs font-medium text-slate-950 dark:text-white">{userEmail}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Workspace account</p>
        </div>

        <div className="mt-1 space-y-0.5">
          {accountActions.map((action) => {
            const className = cn(
              "flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-left text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-white/20",
              action.href === "/auth/signout"
                ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-200 dark:hover:bg-rose-400/10 dark:hover:text-rose-100"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.055] dark:hover:text-white"
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
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#02040a]/95 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Brand />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            className="grid size-10 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08] dark:focus-visible:ring-white/20"
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
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
          />

          <div className="absolute inset-x-3 top-20 max-h-[calc(100svh-5.75rem)] overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.25)] dark:border-white/[0.08] dark:bg-[#050810] dark:shadow-[0_28px_90px_-48px_rgba(0,0,0,0.95)]">
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr]">
              <PlanCard credits={credits} planLabel={planLabel} />
              <AccountMenu userEmail={userEmail} variant="mobile" onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}

      <aside className="hidden w-[236px] shrink-0 border-r border-slate-200 bg-white lg:block dark:border-white/[0.08] dark:bg-[#050810] xl:w-[244px]">
        <div className="sticky top-0 flex h-screen min-h-0 flex-col px-3 py-4">
          <Brand />

          <div className="mt-7 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.35)_transparent]">
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
