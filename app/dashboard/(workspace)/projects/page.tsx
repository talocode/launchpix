import Link from "next/link";
import { ArrowRight, FolderPlus, Layers3, Sparkles } from "lucide-react";
import { EmptyProjectsState } from "@/components/dashboard/empty-projects";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/supabase/auth";
import { listUserProjects } from "@/lib/services/projects/queries";

const textMap: Record<string, string> = {
  browser_extension: "Browser Extension",
  saas: "Web App",
  web_app: "Web App",
  mobile_app: "Mobile App",
  other: "Other",
  chrome_web_store: "Chrome Web Store",
  firefox_addons: "Firefox Add-ons",
  product_launch: "Product Launch",
  saas_marketing: "Product Marketing",
  general_promo: "General Promo"
};

export default async function ProjectsPage() {
  const { user } = await requireUser();
  const projects = await listUserProjects(user.id);

  if (!projects.length) {
    return <EmptyProjectsState />;
  }

  const activeCount = projects.filter((project) => project.status !== "completed").length;
  const totalUploads = projects.reduce((count, project) => count + (project.uploads?.[0]?.count ?? 0), 0);

  return (
    <div className="dashboard-page">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="dashboard-card p-6 sm:p-7">
          <p className="dashboard-label">Projects</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">All launch workspaces in one operational view.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Track what is active, what is blocked, and which project is ready for generation or export without digging through separate screens.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/projects/new">
                Create project
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/settings/billing">Manage credits</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          {[
            { label: "Projects", value: String(projects.length), icon: FolderPlus },
            { label: "Active", value: String(activeCount), icon: Sparkles },
            { label: "Uploads", value: String(totalUploads), icon: Layers3 }
          ].map((item) => (
            <div key={item.label} className="dashboard-card p-5">
              <div className="flex items-center justify-between">
                <p className="dashboard-label">{item.label}</p>
                <item.icon className="size-4 text-slate-400" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-card overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.6fr)_180px_120px_160px_140px] gap-4 border-b border-white/8 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          <span>Project</span>
          <span>Platform</span>
          <span>Screenshots</span>
          <span>Status</span>
          <span>Updated</span>
        </div>

        <div className="divide-y divide-white/8">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="grid grid-cols-[minmax(0,1.6fr)_180px_120px_160px_140px] items-center gap-4 px-6 py-4 transition hover:bg-white/[0.03]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{project.name}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{textMap[project.product_type] || project.product_type}</p>
              </div>
              <p className="text-sm text-slate-300">{textMap[project.platform] || project.platform}</p>
              <p className="text-sm text-slate-300">{project.uploads?.[0]?.count || 0}</p>
              <div className="min-w-0">
                <StatusBadge status={project.status} />
              </div>
              <p className="text-sm text-slate-400">{new Date(project.updated_at).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
