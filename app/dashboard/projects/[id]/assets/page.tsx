import Link from "next/link";
import { AlertTriangle, Clock3, Download, Images, Sparkles } from "lucide-react";
import { AssetsManager } from "@/components/dashboard/assets-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/supabase/auth";
import { getAccessContext } from "@/lib/services/access/permissions";
import { getGenerationAssets, getGenerationHistory, getLatestGeneration } from "@/lib/services/generations/queries";
import { getProjectOverview } from "@/lib/services/projects/queries";

export default async function AssetsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireUser();
  const { id } = await params;

  try {
    const { project } = await getProjectOverview(id, user.id);
    const generation = await getLatestGeneration(id);
    const history = await getGenerationHistory(id);
    const { plan } = await getAccessContext(user.id);

    if (!generation) {
      return (
        <section className="surface space-y-5 p-6 sm:p-8">
          <p className="eyebrow">Asset studio</p>
          <h1 className="section-title">No generated assets yet for {project.name}.</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Generate the first pack to unlock editable copy, rerender controls, previews, and final export actions.
          </p>
          <Button asChild>
            <Link href={`/dashboard/projects/${id}/generate`}>Start generation</Link>
          </Button>
        </section>
      );
    }

    const assets = await getGenerationAssets(generation.id);
    const completedAt = generation.updated_at ? new Date(generation.updated_at).toLocaleString() : new Date(generation.created_at).toLocaleString();
    const listingCount = assets.filter((asset: { asset_type: string }) => asset.asset_type.includes("listing")).length;
    const qualityWarnings = Array.isArray(generation.style_json?.quality_warnings) ? (generation.style_json?.quality_warnings as Array<{ asset_type: string; code: string; message: string }>) : [];
    const renderSources = generation.style_json?.render_sources && typeof generation.style_json.render_sources === "object" ? generation.style_json.render_sources as Record<string, number> : {};

    return (
      <div className="space-y-6">
        <section className="surface overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="eyebrow">Launch pack result</p>
              <h1 className="section-title mt-4">Your generated assets for {project.name} are ready.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                Review the output as a launch pack, not a loose image dump. Check the hero preview, scan every generated file, then export the pack when the visual story is ready.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[520px]">
              {[
                { label: "Status", value: generation.status.replaceAll("_", " "), icon: Sparkles },
                { label: "Generated", value: `${assets.length} assets`, icon: Images },
                { label: "Export", value: plan.fullResolutionExport ? "Full resolution" : "Preview", icon: Download },
                { label: "Completed", value: completedAt, icon: Clock3 }
              ].map((item) => (
                <div key={item.label} className="surface-muted min-w-[170px] p-4">
                  <item.icon className="size-5 text-foreground" />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 truncate text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="surface p-6">
            <p className="dashboard-label">Quality state</p>
            <h2 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">Pack readiness</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              These signals come from the latest generation run and help you decide whether to ship, refine copy, or rerender a specific asset.
            </p>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border/80 pb-3 text-sm">
                <span className="text-muted-foreground">Warnings</span>
                <span className="font-semibold text-foreground">{qualityWarnings.length}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/80 pb-3 text-sm">
                <span className="text-muted-foreground">Render sources</span>
                <span className="font-semibold text-foreground">{Object.keys(renderSources).length || 1}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Listing frames</span>
                <span className="font-semibold text-foreground">{listingCount}</span>
              </div>
            </div>
          </div>

          <div className="surface p-6">
            <p className="dashboard-label">Latest warnings</p>
            <div className="mt-3 space-y-3">
              {qualityWarnings.length ? qualityWarnings.slice(0, 4).map((warning) => (
                <div key={`${warning.asset_type}-${warning.code}`} className="rounded-[4px] border border-border/80 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <AlertTriangle className="size-3.5" />
                    {warning.asset_type.replaceAll("_", " ")}
                  </div>
                  <p className="mt-2 text-sm text-foreground">{warning.message}</p>
                </div>
              )) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  No active warnings in the latest pack. The generation output is ready for review and export.
                </p>
              )}
            </div>
          </div>
        </section>

        <AssetsManager projectId={id} generation={generation as any} assets={assets as any} canDownloadFull={plan.fullResolutionExport} />

        <Card>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Generation history</p>
                <h2 className="mt-3 text-2xl font-semibold">Recent runs</h2>
              </div>
              <p className="text-sm text-muted-foreground">{listingCount} listing frames in the current pack.</p>
            </div>

            <div className="space-y-3">
              {history.map((item: { id: string; created_at: string; status: string; error_message: string | null }) => (
                <div key={item.id} className="surface-muted flex flex-col gap-2 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{new Date(item.created_at).toLocaleString()}</p>
                    <p className="mt-1 text-muted-foreground">
                      Status: <span className="font-medium text-foreground">{item.status.replaceAll("_", " ")}</span>
                    </p>
                  </div>
                  {item.error_message ? <p className="text-muted-foreground">{item.error_message}</p> : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch {
    return <Card><CardContent className="text-sm leading-7 text-muted-foreground">Unable to load project assets right now.</CardContent></Card>;
  }
}
