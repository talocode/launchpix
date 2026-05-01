import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateAssetMetadata } from "@/lib/services/assets/edits";
import { renderAssetPng } from "@/lib/render/pipeline";
import { generateMistralAssetPng } from "@/lib/ai/mistral-image";
import { generationPlanSchema, templateFamilySchema } from "@/lib/ai/schemas/asset-plan";
import { trackEvent } from "@/lib/services/analytics/events";

const ASSET_BUCKET = process.env.STORAGE_BUCKET_ASSETS || "launchpix-assets";

async function ensureOwnership(assetId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("assets")
    .select("id, file_url, asset_type, width, height, generation_id, metadata_json, generations!inner(id, copy_json, projects!inner(id, user_id, name, product_type, platform, description, audience, primary_color))")
    .eq("id", assetId)
    .eq("generations.projects.user_id", userId)
    .single();

  return data;
}

function editableMetadata(asset: any, body: Record<string, unknown>) {
  return { ...((asset.metadata_json as any)?.editable || {}), ...(body || {}) };
}

async function getGenerationUploads(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("uploads").select("*").eq("project_id", projectId).order("position", { ascending: true });
  return data || [];
}

export async function PATCH(req: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const { user } = await requireUser();
  const { assetId } = await params;
  const body = await req.json();

  const asset = await ensureOwnership(assetId, user.id);
  if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

  await updateAssetMetadata(assetId, body);
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const { user } = await requireUser();
  const { assetId } = await params;
  const asset = await ensureOwnership(assetId, user.id);
  if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const editable = editableMetadata(asset, body);
  const templateFamily = templateFamilySchema.catch("minimal").parse(editable.templateFamily || (asset.metadata_json as any)?.template_family || "minimal");
  const project = (asset as any).generations?.projects;
  const generation = (asset as any).generations;
  let renderSource: "mistral_image_generation" | "deterministic_template" = "mistral_image_generation";
  let png: Buffer | Uint8Array;

  try {
    const parsedPlan = generationPlanSchema.parse(generation.copy_json);
    const originalPlanAsset = parsedPlan.assets.find((item) => item.asset_type === asset.asset_type) || parsedPlan.assets[0];
    const uploads = await getGenerationUploads(project.id);
    const screenshotById = new Map(uploads.map((upload: any) => [upload.id, upload.file_url]));
    const screenshotUrls = originalPlanAsset.screenshot_ids.map((id) => screenshotById.get(id)).filter(Boolean) as string[];

    png = await generateMistralAssetPng({
      plan: parsedPlan,
      asset: {
        ...originalPlanAsset,
        asset_type: asset.asset_type,
        width: asset.width,
        height: asset.height,
        headline: String(editable.headline || originalPlanAsset.headline),
        subheadline: String(editable.subheadline || originalPlanAsset.subheadline),
        callouts: Array.isArray(editable.callouts) ? editable.callouts.map(String).slice(0, 3) : originalPlanAsset.callouts,
        template_family: templateFamily,
        screenshotUrls
      },
      project
    });
  } catch (error) {
    renderSource = "deterministic_template";
    console.error("Mistral asset rerender failed; using deterministic renderer:", error instanceof Error ? error.message : error);
    png = await renderAssetPng({
      width: asset.width,
      height: asset.height,
      templateFamily,
      headline: String(editable.headline || "Launch visuals in minutes"),
      subheadline: String(editable.subheadline || "Deterministic, conversion-focused design output."),
      callouts: Array.isArray(editable.callouts) ? editable.callouts.map(String).slice(0, 3) : ["Premium templates", "Reliable exports", "Built for product launches"],
      cta: "Try LaunchPix",
      screenshotUrls: [],
      primaryColor: String(editable.primaryColor || project?.primary_color || "#4F46E5")
    });
  }

  const path = `${user.id}/rerendered/${asset.generation_id}/${asset.id}.png`;
  const supabase = await createSupabaseServerClient();
  const { error: uploadError } = await supabase.storage.from(ASSET_BUCKET).upload(path, png, { upsert: true, contentType: "image/png" });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: pub } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path);
  await supabase
    .from("assets")
    .update({
      file_url: pub.publicUrl,
      preview_url: pub.publicUrl,
      metadata_json: {
        ...((asset.metadata_json as Record<string, unknown> | null) || {}),
        editable,
        render_source: renderSource,
        rerendered_at: new Date().toISOString()
      }
    })
    .eq("id", asset.id);

  await trackEvent({ userId: user.id, projectId: project?.id, eventType: "asset_rerendered", metadata: { assetId: asset.id, generationId: asset.generation_id, render_source: renderSource } });

  return NextResponse.json({ ok: true, file_url: pub.publicUrl, render_source: renderSource });
}
