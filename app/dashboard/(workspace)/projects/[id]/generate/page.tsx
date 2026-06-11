import { GeneratePanel } from "@/components/dashboard/generate-panel";
import { requireUser } from "@/lib/supabase/auth";
import { getAccessContext } from "@/lib/services/access/permissions";
import { getLatestGeneration } from "@/lib/services/generations/queries";
import { getProjectOverview } from "@/lib/services/projects/queries";

export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireUser();
  const { id } = await params;

  const { project, uploads } = await getProjectOverview(id, user.id);
  const generation = await getLatestGeneration(id);
  const { plan, subscription } = await getAccessContext(user.id);

  const missing: string[] = [];
  if (!project.description) missing.push("project description");
  if (!uploads.length) missing.push("at least one screenshot");
  if (!project.style_preset) missing.push("style preset");
  if (subscription.credits_remaining <= 0) missing.push("credits");

  const ready = missing.length === 0;

  return (
    <div className="space-y-4">
      <section className="surface overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="dashboard-label">Generation workspace</p>
            <h2 className="mt-2 truncate font-mono text-2xl font-light tracking-[-0.04em] text-foreground sm:text-3xl">{project.name}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {project.description || "Add a concise project description so Talocode LaunchPix can build a sharper asset story."}
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 xl:w-[560px]">
            {[
              ["Account", plan.label],
              ["Credits", subscription.credits_remaining.toString()],
              ["Uploads", `${uploads.length}/5`],
              ["Export", plan.fullResolutionExport ? "Full" : "Preview"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[4px] border border-border/80 bg-transparent px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <div className="rounded-[4px] border border-border/80 px-3 py-2"><span className="text-muted-foreground">Product:</span> <span className="text-foreground">{project.product_type}</span></div>
          <div className="rounded-[4px] border border-border/80 px-3 py-2"><span className="text-muted-foreground">Platform:</span> <span className="text-foreground">{project.platform}</span></div>
          <div className="rounded-[4px] border border-border/80 px-3 py-2"><span className="text-muted-foreground">Audience:</span> <span className="text-foreground">{project.audience}</span></div>
        </div>
      </section>

      <GeneratePanel projectId={id} ready={ready} missing={missing} credits={subscription.credits_remaining} />
    </div>
  );
}
