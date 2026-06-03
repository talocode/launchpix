"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Download, FileArchive, ImageIcon, PencilLine, RefreshCw, Sparkles } from "lucide-react";
import type { AssetRecord, GenerationRecord } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function assetLabel(type: string) {
  return type.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function assetPurpose(type: string) {
  if (type.includes("listing")) return "Store listing";
  if (type.includes("promo")) return "Campaign tile";
  if (type.includes("hero")) return "Landing hero";
  return "Launch visual";
}

export function AssetsManager({
  projectId,
  generation,
  assets,
  canDownloadFull
}: {
  projectId: string;
  generation: GenerationRecord | null;
  assets: AssetRecord[];
  canDownloadFull: boolean;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [templateFamily, setTemplateFamily] = useState("minimal");
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function save(assetId: string) {
    setActionError(null);
    const res = await fetch(`/api/assets/${assetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline, subheadline, templateFamily })
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setActionError(json.error || "Could not save this asset.");
      return;
    }
    setEditing(null);
    window.location.reload();
  }

  async function rerenderAsset(assetId: string) {
    setActionError(null);
    const res = await fetch(`/api/assets/${assetId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateFamily })
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setActionError(json.error || "Could not rerender this asset.");
      return;
    }
    window.location.reload();
  }

  const heroAsset = assets.find((asset) => asset.asset_type.includes("hero")) ?? assets[0];
  const listingAssets = assets.filter((asset) => asset.asset_type.includes("listing"));

  function warningMessages(asset: AssetRecord) {
    const metadata = asset.metadata_json as { quality_report?: { issues?: Array<{ severity?: string; message?: string }> } } | null;
    const issues = metadata?.quality_report?.issues || [];
    return issues
      .filter((issue) => issue.severity === "warning" && typeof issue.message === "string")
      .map((issue) => issue.message as string);
  }

  return (
    <div className="space-y-6">
      {!canDownloadFull ? (
        <Card className="border-border/80 bg-transparent">
          <CardContent className="space-y-3 p-5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Credits are required for full export.</p>
            <p>Buy credits when your balance runs out to continue downloading full-resolution PNG and ZIP exports.</p>
            <Button asChild variant="outline" size="sm">
              <a href="/settings/billing">Buy credits</a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="surface overflow-hidden p-5 sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-stretch">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="dashboard-label">Generated pack</p>
                <h2 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">Review the pack before you ship it.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  This is the finished output from your latest generation: inspect the hierarchy, download files, or adjust copy and rerender individual assets.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button asChild>
                  <a href={`/api/export/${generation?.id}`}>
                    <FileArchive className="size-4" />
                    Download ZIP
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={`/dashboard/projects/${projectId}/generate`}>
                    <RefreshCw className="size-4" />
                    Regenerate
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Total assets", assets.length.toString()],
                ["Listing frames", listingAssets.length.toString()],
                ["Export mode", canDownloadFull ? "Full resolution" : "Preview"]
              ].map(([label, value]) => (
                <div key={label} className="surface-muted p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-muted overflow-hidden p-3">
            {heroAsset ? (
              <>
                <div className="flex items-center justify-between px-1 pb-3 text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-[0.18em]">{assetPurpose(heroAsset.asset_type)}</span>
                  <span>
                    {heroAsset.width} x {heroAsset.height}
                  </span>
                </div>
                <img
                  src={heroAsset.preview_url || heroAsset.file_url}
                  alt={assetLabel(heroAsset.asset_type)}
                  className="aspect-video w-full rounded-[4px] border border-border/80 bg-card object-cover"
                />
              </>
            ) : (
              <div className="grid aspect-video place-items-center rounded-[4px] border border-dashed border-border/80 text-sm text-muted-foreground">
                No preview asset found.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="dashboard-label">Asset review</p>
            <h2 className="mt-2 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">All generated files</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Download the final asset directly, or edit the text layer and rerender when a headline needs more polish.
          </p>
        </div>
        {actionError ? <p className="rounded-[4px] border border-border/80 bg-transparent px-4 py-3 text-sm text-foreground">{actionError}</p> : null}

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.16em]">
                  <ImageIcon className="size-3.5" />
                  {assetPurpose(asset.asset_type)}
                </span>
                <span>
                  {asset.width} x {asset.height}
                </span>
              </div>

              <CardContent className="space-y-4 p-4">
                <img src={asset.preview_url || asset.file_url} alt={assetLabel(asset.asset_type)} className="aspect-[16/10] w-full rounded-[4px] border border-border/80 bg-card object-cover" />

                <div>
                  <h3 className="text-base font-semibold text-foreground">{assetLabel(asset.asset_type)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Template: {(asset.metadata_json as { template_family?: string } | null)?.template_family || "minimal"}</p>
                  <p className="mt-2 inline-flex items-center gap-2 rounded-none border border-border/80 px-3 py-1 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5" />
                    {(asset.metadata_json as { render_source?: string } | null)?.render_source === "mistral_image_generation" ? "Mistral image generated" : "Template fallback"}
                  </p>
                  {warningMessages(asset).length ? (
                    <div className="mt-3 rounded-[4px] border border-border/80 bg-transparent p-2.5">
                      <p className="inline-flex items-center gap-2 text-xs font-semibold text-foreground">
                        <AlertTriangle className="size-3.5" />
                        Quality warnings
                      </p>
                      <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                        {warningMessages(asset).map((message, index) => (
                          <p key={`${asset.id}-warning-${index}`}>{message}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <Button size="sm" asChild>
                    <a href={`/api/assets/${asset.id}/download`}>
                      <Download className="size-4" />
                      Download
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditing(asset.id); setHeadline(""); setSubheadline(""); }}>
                    <PencilLine className="size-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" disabled={pending} onClick={() => startTransition(() => void rerenderAsset(asset.id))}>
                    <RefreshCw className="size-4" />
                    Rerender
                  </Button>
                </div>

                {editing === asset.id ? (
                  <div className="surface-muted space-y-3 p-4">
                    <input className="field h-10" placeholder="Headline" value={headline} onChange={(event) => setHeadline(event.target.value)} />
                    <input className="field h-10" placeholder="Subheadline" value={subheadline} onChange={(event) => setSubheadline(event.target.value)} />
                    <select className="field-select h-10" value={templateFamily} onChange={(event) => setTemplateFamily(event.target.value)}>
                      <option value="minimal">Minimal</option>
                      <option value="bold">Bold</option>
                      <option value="dark">Dark</option>
                      <option value="gradient">Gradient</option>
                    </select>
                    <div className="flex gap-2">
                      <Button size="sm" disabled={pending} onClick={() => startTransition(() => void save(asset.id))}>
                        Save changes
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
