import Link from "next/link";
import { ProjectSummaryCard } from "@/components/dashboard/project-summary-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/supabase/auth";
import { getProjectOverview } from "@/lib/services/projects/queries";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireUser();
  const { id } = await params;
  const { project, uploads } = await getProjectOverview(id, user.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="surface p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Project detail</p>
              <h2 className="mt-4 text-3xl font-semibold">{project.name}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                Review identity, screenshot readiness, and the next best action before generating the final asset pack.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status={project.status} />
              <Button asChild>
                <Link href={`/dashboard/projects/${id}/generate`}>Generate assets</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/dashboard/projects/new?projectId=${id}&step=1`}>Edit brief</Link>
              </Button>
            </div>
          </div>
        </section>

        <Card>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Identity</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{project.description}</p>
            </div>
            <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-muted-foreground">Type</p><p className="mt-1 font-medium">{project.product_type}</p></div>
              <div><p className="text-muted-foreground">Platform</p><p className="mt-1 font-medium">{project.platform}</p></div>
              <div><p className="text-muted-foreground">Audience</p><p className="mt-1 font-medium">{project.audience}</p></div>
              <div><p className="text-muted-foreground">Website</p><p className="mt-1 font-medium">{project.website_url || "Not set"}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Screenshot stack</p>
                <h3 className="mt-2 text-xl font-semibold">{uploads.length} upload{uploads.length === 1 ? "" : "s"} ready</h3>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/projects/new?projectId=${id}&step=2`}>Manage uploads</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {uploads.length ? uploads.slice(0, 4).map((upload) => (
                <img key={upload.id} src={upload.file_url} alt={upload.original_filename} className="h-32 w-full rounded-[20px] border border-border/60 object-cover" />
              )) : <p className="text-sm text-muted-foreground">No uploads yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <ProjectSummaryCard
        name={project.name}
        productType={project.product_type}
        platform={project.platform}
        audience={project.audience}
        style={project.style_preset}
        screenshotCount={uploads.length}
      />
    </div>
  );
}
