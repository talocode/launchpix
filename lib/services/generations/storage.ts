import JSZip from "jszip";
import type { GenerationPlan } from "@/lib/ai/schemas/asset-plan";
import type { PlanConfig } from "@/lib/services/billing/plans";
import type { ProjectRecord } from "@/types/project";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RenderedAsset } from "@/lib/services/generations/renderer";

const ASSET_BUCKET = process.env.STORAGE_BUCKET_ASSETS || "launchpix-assets";

export type PersistAssetsAndZipInput = {
  supabase: SupabaseClient;
  project: ProjectRecord;
  generationId: string;
  plan: PlanConfig;
  safePlan: GenerationPlan;
  renderedAssets: RenderedAsset[];
  qualityFailures: Array<{ assetType: string; issues: string[] }>;
};

export type PersistAssetsAndZipResult = {
  zipUrl: string;
};

export async function persistAssetsAndZip(input: PersistAssetsAndZipInput): Promise<PersistAssetsAndZipResult> {
  const { supabase, project, generationId, plan, safePlan, renderedAssets, qualityFailures } = input;

  if (qualityFailures.length) {
    const failureMessage = qualityFailures
      .map((failure) => `${failure.assetType}: ${failure.issues.join(" | ")}`)
      .join(" ; ");
    throw new Error(`Quality check failed. Fix the project brief and rerun generation. ${failureMessage}`);
  }

  const zip = new JSZip();

  for (const rendered of renderedAssets) {
    const { asset, fullPng, previewPng, renderSource, qualityReport, assetStartedAt, filename } = rendered;
    const fullPath = `${project.user_id}/${project.id}/${generationId}/full/${filename}`;
    const previewPath = `${project.user_id}/${project.id}/${generationId}/preview/${filename}`;

    const { error: fullError } = await supabase.storage.from(ASSET_BUCKET).upload(fullPath, fullPng, { contentType: "image/png", upsert: true });
    if (fullError) throw new Error(fullError.message);
    const { error: previewError } = await supabase.storage.from(ASSET_BUCKET).upload(previewPath, previewPng, { contentType: "image/png", upsert: true });
    if (previewError) throw new Error(previewError.message);

    const { data: fullUrl } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(fullPath);
    const { data: previewUrl } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(previewPath);

    await supabase.from("assets").insert({
      generation_id: generationId,
      asset_type: asset.asset_type,
      width: asset.width,
      height: asset.height,
      file_url: fullUrl.publicUrl,
      preview_url: previewUrl.publicUrl,
      metadata_json: {
        template_family: asset.template_family,
        render_source: renderSource,
        notes: asset.notes,
        callouts: asset.callouts,
        screenshot_ids: asset.screenshot_ids,
        render_duration_ms: Date.now() - assetStartedAt,
        watermark_required: plan.watermarkPreview,
        quality_report: qualityReport
      }
    });

    zip.file(filename, fullPng);
  }

  const zipBuffer = await zip.generateAsync({ type: "uint8array" });
  const zipPath = `${project.user_id}/${project.id}/${generationId}/launchpix-pack.zip`;
  await supabase.storage.from(ASSET_BUCKET).upload(zipPath, zipBuffer, { contentType: "application/zip", upsert: true });
  const { data: zipUrl } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(zipPath);

  return { zipUrl: zipUrl.publicUrl };
}