"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AppWindow,
  BookOpen,
  CreditCard,
  FileText,
  KeyRound,
  LayoutDashboard,
  Menu,
  Radio,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = { href: Route; label: string; icon: LucideIcon };

const manageItems: NavItem[] = [
  { href: "/dashboard/api", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/api/keys", label: "API Keys", icon: KeyRound },
  { href: "/dashboard/api/usage", label: "Usage", icon: Activity },
  { href: "/dashboard/api/billing", label: "Billing", icon: CreditCard }
];

const playgroundItems: NavItem[] = [{ href: "/dashboard/api/apps", label: "Apps", icon: AppWindow }];

const buildItems: NavItem[] = [
  { href: "/docs/api", label: "Documentation", icon: BookOpen },
  { href: "/contact", label: "Status", icon: Radio },
  { href: "/pricing", label: "Pricing", icon: FileText }
];

function isActive(pathname: string, href: Route) {
  if (href === "/dashboard/api") return pathname === "/dashboard/api";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavSection({
  title,
  items,
  pathname,
  onNavigate
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a8a8a]">{title}</p>
      <nav className="mt-2 space-y-0.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium transition-colors",
                active
                  ? "bg-[#151515] text-[#f5f5f5]"
                  : "text-[#a1a1a1] hover:bg-[#111111] hover:text-[#f5f5f5]"
              )}
            >
              <item.icon className="size-4 shrink-0 opacity-80" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link href="/dashboard/api" className="block px-3 py-1" onClick={onNavigate}>
        <p className="text-sm font-semibold tracking-tight text-[#f5f5f5]">LaunchPix API</p>
        <p className="mt-0.5 text-xs text-[#8a8a8a]">Launch-ready visuals through one API</p>
      </Link>

      <NavSection title="Manage" items={manageItems} pathname={pathname} onNavigate={onNavigate} />
      <NavSection title="Playground" items={playgroundItems} pathname={pathname} onNavigate={onNavigate} />
      <NavSection title="Build" items={buildItems} pathname={pathname} onNavigate={onNavigate} />
    </>
  );
}

export function ApiSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[#090909] px-4 lg:hidden">
        <Link href="/dashboard/api" className="text-sm font-semibold text-[#f5f5f5]">
          LaunchPix API
        </Link>
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
          className="grid size-9 place-items-center rounded-lg border border-[rgba(255,255,255,0.08)] text-[#f5f5f5]"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu backdrop"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(280px,88vw)] overflow-y-auto border-r border-[rgba(255,255,255,0.08)] bg-[#090909] p-4 pt-16">
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <p className="mt-8 truncate px-3 text-xs text-[#8a8a8a]">{userEmail}</p>
          </aside>
        </div>
      ) : null}

      <aside className="api-dashboard-sidebar fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-[rgba(255,255,255,0.08)] bg-[#090909] lg:flex">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-5">
          <SidebarContent pathname={pathname} />
        </div>
        <div className="border-t border-[rgba(255,255,255,0.08)] px-3 py-4">
          <p className="truncate text-xs text-[#8a8a8a]">{userEmail}</p>
          <Link href="/dashboard" className="mt-2 inline-block text-xs text-[#a1a1a1] hover:text-[#f5f5f5]">
            Back to launch workspace
          </Link>
        </div>
      </aside>

      <div className="h-14 shrink-0 lg:hidden" aria-hidden />
    </>
  );
}