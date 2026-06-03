import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Download, Folder, Package, Sparkles, Zap } from "lucide-react";
import { requireUser } from "@/lib/supabase/auth";
import { getAccessContext } from "@/lib/services/access/permissions";
import { listUserProjects } from "@/lib/services/projects/queries";

function statusTone(status: unknown) {
  const value = typeof status === "string" ? status.toLowerCase() : "draft";
  if (value.includes("complete")) return "border-border/80 bg-transparent text-foreground";
  if (value.includes("progress") || value.includes("generating")) return "border-border/80 bg-transparent text-muted-foreground";
  if (value.includes("failed")) return "border-border/80 bg-transparent text-foreground";
  return "border-border/80 bg-transparent text-muted-foreground";
}

function prettyStatus(status: unknown) {
  const raw = typeof status === "string" ? status : "draft";
  return raw.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

export default async function DashboardPage() {
  const { user } = await requireUser();
  const { subscription, plan } = await getAccessContext(user.id);
  const projects = await listUserProjects(user.id);

  const activeProject = projects[0];
  const activeProjectsCount = projects.filter((project) => project.status !== "completed").length;
  const generatedPacksCount = projects.reduce((total, project) => {
    const generations = Array.isArray(project.generations) ? project.generations : [];
    return total + generations.filter((generation) => generation?.status === "completed").length;
  }, 0);
  const exportReady = plan.fullResolutionExport ? generatedPacksCount + Math.max(0, projects.length - 1) : generatedPacksCount;
  const uploadCount = activeProject?.uploads?.[0]?.count ?? 0;

  const kpis = [
    { label: "Credits", value: `${subscription.credits_remaining}`, detail: "Available for upcoming generations", icon: Zap },
    { label: "Active projects", value: String(activeProjectsCount), detail: "Drafts and in-progress work", icon: Folder },
    { label: "Generated packs", value: String(generatedPacksCount), detail: "Completed generation runs", icon: Package },
    { label: "Export ready", value: String(exportReady), detail: "Assets available to download", icon: Download }
  ];

  const recentProjects = projects.slice(0, 5);

  return (
    <div className="dashboard-page">
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="dashboard-card overflow-hidden p-6 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="dashboard-label">Launch workspace</p>
              <h2 className="mt-3 font-mono text-3xl font-light tracking-[-0.05em] text-foreground sm:text-[2.2rem]">Your launch visuals, organized from first brief to final export.</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Keep project identity, screenshot sequencing, pack generation, and export access in one controlled workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/projects/new" className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-foreground px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-background hover:opacity-85">
                New project
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/dashboard/projects" className="inline-flex h-11 items-center rounded-[4px] border border-border/80 bg-transparent px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground hover:bg-muted/60">
                View projects
              </Link>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[4px] border border-border/80 bg-muted/50">
            <Image
              src="/assets/talocode-banner.svg"
              alt="Talocode brand banner"
              width={1600}
              height={900}
              className="h-auto w-full object-cover"
              priority={false}
            />
          </div>
        </div>

        <div className="dashboard-card p-6 sm:p-7">
          <p className="dashboard-label">Credit posture</p>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <span className="text-muted-foreground">Account</span>
              <span className="font-medium text-foreground">{plan.label}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <span className="text-muted-foreground">Credits left</span>
              <span className="font-medium text-foreground">{subscription.credits_remaining}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <span className="text-muted-foreground">Export access</span>
              <span className="font-medium text-foreground">{plan.fullResolutionExport ? "Full resolution" : "Preview only"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Billing model</span>
              <span className="font-medium text-foreground">Usage credits</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.label} className="dashboard-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="dashboard-label">{item.label}</p>
                <p className="mt-3 font-mono text-3xl font-light tracking-[-0.05em] text-foreground">{item.value}</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-[4px] border border-border/80 bg-transparent text-muted-foreground">
                <item.icon className="size-5" />
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="dashboard-card p-6 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="dashboard-label">Current project</p>
              <h3 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">{activeProject?.name ?? "No active project yet"}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                {activeProject
                  ? `${activeProject.product_type.replaceAll("_", " ")} - ${uploadCount} screenshots uploaded - updated ${new Date(activeProject.updated_at).toLocaleDateString()}`
                  : "Create a project to define the brief, upload screenshots, and generate the first launch pack."}
              </p>
            </div>
            {activeProject ? <span className={`rounded-none border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${statusTone(activeProject.status)}`}>{prettyStatus(activeProject.status)}</span> : null}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              { label: "Define identity", done: Boolean(activeProject?.description) },
              { label: "Upload screenshots", done: uploadCount > 0 },
              { label: "Generate pack", done: generatedPacksCount > 0 },
              { label: "Export assets", done: exportReady > 0 }
            ].map((step, index) => (
              <div key={step.label} className="dashboard-card-muted p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">{step.label}</span>
                  <span className={`flex size-7 items-center justify-center rounded-none border border-border/80 text-xs font-semibold ${step.done ? "bg-transparent text-foreground" : "bg-transparent text-muted-foreground"}`}>
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={activeProject ? `/dashboard/projects/${activeProject.id}` : "/dashboard/projects/new"} className="inline-flex h-11 items-center rounded-[4px] bg-foreground px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-background hover:opacity-85">
              {activeProject ? "Open project" : "Create project"}
            </Link>
            <Link href={activeProject ? `/dashboard/projects/${activeProject.id}/generate` : "/dashboard/projects/new"} className="inline-flex h-11 items-center rounded-[4px] border border-border/80 bg-transparent px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground hover:bg-muted/60">
              Generate pack
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="dashboard-card p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="dashboard-label">Recent projects</p>
              <Link href="/dashboard/projects" className="text-sm text-muted-foreground hover:text-foreground">View all</Link>
            </div>
            <div className="mt-5 space-y-3">
              {recentProjects.length ? recentProjects.map((project) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="dashboard-card-muted flex items-center justify-between gap-4 p-4 hover:opacity-80">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{project.name}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{project.product_type.replaceAll("_", " ")}</p>
                  </div>
                  <span className={`rounded-none border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${statusTone(project.status)}`}>{prettyStatus(project.status)}</span>
                </Link>
              )) : <p className="text-sm text-muted-foreground">No projects yet.</p>}
            </div>
          </div>

          <div className="dashboard-card p-6 sm:p-7">
            <p className="dashboard-label">Activity summary</p>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Generation workflow stays in one place</p>
                  <p className="mt-1 text-muted-foreground">Review project brief, uploads, generation status, and export access without leaving the dashboard.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Best next step</p>
                  <p className="mt-1 text-muted-foreground">{activeProject ? `Continue ${activeProject.name} or generate a fresh pack.` : "Create the first project to activate the full launch workflow."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
