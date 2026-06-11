"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bolt, Plus, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const copyMap = [
  { match: "/dashboard/projects/new", title: "New Project", description: "Define the brief, upload screenshots, and set the visual direction." },
  { match: "/dashboard/projects/", title: "Project Workspace", description: "Review the brief, generation state, and launch asset readiness." },
  { match: "/dashboard/projects", title: "Projects", description: "Track every launch workspace, status, and screenshot stack in one place." },
  { match: "/settings/billing", title: "Billing", description: "Manage credits and one-time top-ups." },
  { match: "/settings", title: "Settings", description: "Control workspace defaults, account details, and credit posture." },
  { match: "/dashboard", title: "Overview", description: "Track projects, generate packs, and export launch-ready visuals." }
] as const;

export function DashboardTopbar({ credits, planLabel }: { credits: number; planLabel: string }) {
  const pathname = usePathname() ?? "/dashboard";
  const current = copyMap.find((item) => pathname.startsWith(item.match)) ?? copyMap[copyMap.length - 1];

  return (
    <header className="sticky top-[57px] z-30 border-b border-border/80 bg-background/95 px-4 py-2.5 backdrop-blur-xl lg:top-0 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 xl:max-w-[420px]">
          <div className="flex items-center gap-2">
            <span className="hidden h-2 w-2 rounded-none bg-foreground sm:inline-flex" />
            <h1 className="truncate font-mono text-[18px] font-light uppercase tracking-[-0.04em] text-foreground sm:text-[20px]">{current.title}</h1>
          </div>
          <p className="mt-1 hidden truncate text-[11px] uppercase tracking-[0.16em] text-muted-foreground md:block xl:hidden">{current.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-9 min-w-[180px] flex-1 items-center gap-2 rounded-[4px] border border-border/80 bg-transparent px-3 xl:w-[280px] xl:flex-none">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              placeholder="Search projects, assets, generations..."
              className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>

          <ThemeToggle />

          <div className="flex h-9 items-center gap-2 rounded-[4px] border border-border/80 bg-transparent px-3 text-xs text-muted-foreground">
            <Bolt className="size-3.5 text-foreground/60" />
            <span className="font-semibold text-foreground">{credits}</span>
            <span>credits</span>
          </div>

          <div className="hidden h-9 items-center rounded-[4px] border border-border/80 bg-transparent px-3 text-xs text-muted-foreground md:flex">
            {planLabel}
          </div>

          <Link href="/dashboard/projects/new" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-foreground px-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-background hover:opacity-85">
            <Plus className="size-3.5" />
            New project
          </Link>
        </div>
      </div>
    </header>
  );
}
