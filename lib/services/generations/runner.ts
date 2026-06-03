import JSZip from "jszip";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mistralAdapter } from "@/lib/ai/generate-asset-plan";
import { generateMistralAssetPng } from "@/lib/ai/mistral-image";
import { createDeterministicGenerationPlan } from "@/lib/ai/mistral";
import { generationPlanSchema } from "@/lib/ai/schemas/asset-plan";
import { buildDeterministicAssets, renderAssetPng } from "@/lib/render/pipeline";
import { runAssetQualityChecks, type QualityIssue } from "@/lib/render/quality";
import type { ProjectRecord, UploadRecord } from "@/types/project";
import { consumeGenerationCredit, getOrCreateSubscription, refundGenerationCredit } from "@/lib/services/billing/subscription";
import { PLAN_CONFIG } from "@/lib/services/billing/plans";
import { trackEvent } from "@/lib/services/analytics/events";

const ASSET_BUCKET = process.env.STORAGE_BUCKET_ASSETS || "launchpix-assets";
const MISTRAL_ASSET_TIMEOUT_MS = 45_000;
const MISTRAL_RENDER_ATTEMPTS = 2;

type QualityFailureDetail = QualityIssue & {
  asset_type: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function generateMistralAssetWithRetry(input: Parameters<typeof generateMistralAssetPng>[0]) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MISTRAL_RENDER_ATTEMPTS; attempt += 1) {
    try {
      return await withTimeout(generateMistralAssetPng(input), MISTRAL_ASSET_TIMEOUT_MS, "Mistral image generation");
    } catch (error) {
      lastError = error;
      if (attempt < MISTRAL_RENDER_ATTEMPTS) await sleep(850 * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Mistral image generation failed.");
}

export async function runGenerationForProject(project: ProjectRecord, uploads: UploadRecord[]) {
  const supabase = await createSupabaseServerClient();
  const generationStartedAt = Date.now();
  let creditRefunded = false;
  let creditConsumed = false;

  const { data: generation, error: generationError } = await supabase
    .from("generations")
    .insert({ project_id: project.id, status: "queued" })
    .select("*")
    .single();

  if (generationError || !generation) throw new Error(generationError?.message || "Failed to create generation record");

  try {
    const subscription = await consumeGenerationCredit(project.user_id);
    creditConsumed = true;
    const plan = PLAN_CONFIG[(subscription.plan as keyof typeof PLAN_CONFIG) || "credits"] || PLAN_CONFIG.credits;

    await trackEvent({ userId: project.user_id, projectId: project.id, eventType: "generation_started", metadata: { generationId: generation.id, projectName: project.name } });
    await supabase.from("generations").update({ status: "analyzing" }).eq("id", generation.id);

    const planningInput = {
      project: {
        name: project.name,
        product_type: project.product_type,
        platform: project.platform,
        description: project.description,
        audience: project.audience,
        style_preset: project.style_preset,
        style_prompt: project.style_prompt
      },
      uploads: uploads.map((u) => ({ id: u.id, file_url: u.file_url, position: u.position }))
    };

    const planResponse = await mistralAdapter.generateAssetPlan(planningInput).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error("AI planning failed; continuing with deterministic plan:", message);
      return createDeterministicGenerationPlan(planningInput);
    });

    const safePlan = generationPlanSchema.parse(planResponse);

    await supabase
      .from("generations")
      .update({ status: "generating_copy", ai_summary: safePlan, copy_json: safePlan, style_json: safePlan })
      .eq("id", generation.id);

    await supabase.from("generations").update({ status: "rendering_assets" }).eq("id", generation.id);

    const deterministicAssets = buildDeterministicAssets(safePlan, uploads);
    const zip = new JSZip();
    const renderSources: Record<string, number> = {};
    const qualityFailures: Array<{ assetType: string; issues: string[] }> = [];
    const qualityWarnings: QualityFailureDetail[] = [];

    for (const [index, asset] of deterministicAssets.entries()) {
      let renderSource: "mistral_image_generation" | "deterministic_template" = "mistral_image_generation";
      let fullPng: Buffer | Uint8Array;
      const assetStartedAt = Date.now();
      const qualityReport = runAssetQualityChecks({
        assetType: asset.asset_type,
        templateFamily: asset.template_family,
        headline: asset.headline,
        subheadline: asset.subheadline,
        callouts: asset.callouts,
        cta: safePlan.cta_line,
        screenshotUrls: asset.screenshotUrls,
        primaryColor: project.primary_color
      });

      if (!qualityReport.pass) {
        qualityFailures.push({
          assetType: asset.asset_type,
          issues: qualityReport.issues.filter((issue) => issue.severity === "error").map((issue) => issue.message)
        });
        continue;
      }

      for (const issue of qualityReport.issues.filter((item) => item.severity === "warning")) {
        qualityWarnings.push({
          asset_type: asset.asset_type,
          code: issue.code,
          message: issue.message,
          severity: issue.severity
        });
      }

      try {
        fullPng = await generateMistralAssetWithRetry({
          plan: safePlan,
          asset,
          project: {
            name: project.name,
            product_type: project.product_type,
            platform: project.platform,
            description: project.description,
            audience: project.audience,
            primary_color: project.primary_color
          }
        });
      } catch (error) {
        renderSource = "deterministic_template";
        console.error("Mistral image generation failed; using deterministic renderer:", error instanceof Error ? error.message : error);
        fullPng = await renderAssetPng({
          width: asset.width,
          height: asset.height,
          templateFamily: asset.template_family,
          headline: asset.headline,
          subheadline: asset.subheadline,
          callouts: asset.callouts,
          cta: safePlan.cta_line,
          screenshotUrls: asset.screenshotUrls,
          primaryColor: project.primary_color
        });
      }
      renderSources[renderSource] = (renderSources[renderSource] || 0) + 1;

      const previewPng = fullPng;

      const filename = `${String(index + 1).padStart(2, "0")}-${asset.asset_type}.png`;
      const fullPath = `${project.user_id}/${project.id}/${generation.id}/full/${filename}`;
      const previewPath = `${project.user_id}/${project.id}/${generation.id}/preview/${filename}`;

      const { error: fullError } = await supabase.storage.from(ASSET_BUCKET).upload(fullPath, fullPng, { contentType: "image/png", upsert: true });
      if (fullError) throw new Error(fullError.message);
      const { error: previewError } = await supabase.storage.from(ASSET_BUCKET).upload(previewPath, previewPng, { contentType: "image/png", upsert: true });
      if (previewError) throw new Error(previewError.message);

      const { data: fullUrl } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(fullPath);
      const { data: previewUrl } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(previewPath);

      await supabase.from("assets").insert({
        generation_id: generation.id,
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

    if (qualityFailures.length) {
      const failureMessage = qualityFailures
        .map((failure) => `${failure.assetType}: ${failure.issues.join(" | ")}`)
        .join(" ; ");
      throw new Error(`Quality check failed. Fix the project brief and rerun generation. ${failureMessage}`);
    }

    const zipBuffer = await zip.generateAsync({ type: "uint8array" });
    const zipPath = `${project.user_id}/${project.id}/${generation.id}/launchpix-pack.zip`;
    await supabase.storage.from(ASSET_BUCKET).upload(zipPath, zipBuffer, { contentType: "application/zip", upsert: true });
    const { data: zipUrl } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(zipPath);

    await supabase
      .from("generations")
      .update({
        status: "completed",
        style_json: { ...safePlan, zip_url: zipUrl.publicUrl, render_sources: renderSources, quality_warnings: qualityWarnings }
      })
      .eq("id", generation.id);
    await supabase.from("projects").update({ status: "completed" }).eq("id", project.id);
    if (qualityWarnings.length) {
      await trackEvent({
        userId: project.user_id,
        projectId: project.id,
        eventType: "quality_warning",
        metadata: {
          generationId: generation.id,
          projectName: project.name,
          warning_codes: qualityWarnings.map((item) => item.code),
          warning_assets: qualityWarnings.map((item) => item.asset_type)
        }
      });
    }
    await trackEvent({
      userId: project.user_id,
      projectId: project.id,
      eventType: "generation_completed",
      metadata: {
        generationId: generation.id,
        projectName: project.name,
        duration_ms: Date.now() - generationStartedAt,
        render_sources: renderSources,
        assets: deterministicAssets.length
      }
    });

    return { generationId: generation.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    try {
      if (!creditConsumed) throw new Error("No reserved generation credit to refund.");
      await refundGenerationCredit(project.user_id, message, generation.id);
      creditRefunded = true;
    } catch (refundError) {
      if (creditConsumed) console.error("Failed to refund generation credit:", refundError instanceof Error ? refundError.message : refundError);
    }
    await supabase.from("generations").update({ status: "failed", error_message: message }).eq("id", generation.id);
    await supabase.from("projects").update({ status: "failed" }).eq("id", project.id);
    await trackEvent({
      userId: project.user_id,
      projectId: project.id,
      eventType: "generation_failed",
      metadata: { generationId: generation.id, projectName: project.name, message, credit_refunded: creditRefunded, duration_ms: Date.now() - generationStartedAt }
    });
    throw error;
  }
}

export async function rerenderSingleAsset(assetId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: asset, error } = await supabase.from("assets").select("*").eq("id", assetId).single();
  if (error || !asset) throw new Error("Asset not found");
  return asset;
}

export async function getUserBillingState(userId: string) {
  return getOrCreateSubscription(userId);
}
