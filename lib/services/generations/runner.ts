import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProjectRecord, UploadRecord } from "@/types/project";
import { consumeForGeneration, getUserBillingState, refundForGeneration } from "@/lib/services/generations/billing";
import { createQueuedGeneration } from "@/lib/services/generations/create-generation";
import { failGeneration, finalizeGeneration, trackGenerationStarted } from "@/lib/services/generations/finalize";
import { logGenerationError, logGenerationEvent } from "@/lib/services/generations/logging";
import { markGenerationAnalyzing, planAssets } from "@/lib/services/generations/planner";
import { renderAssets } from "@/lib/services/generations/renderer";
import { persistAssetsAndZip } from "@/lib/services/generations/storage";

export { getUserBillingState } from "@/lib/services/generations/billing";

type RunGenerationOptions = {
  apiKeyId?: string;
};

export async function runGenerationForProject(
  project: ProjectRecord,
  uploads: UploadRecord[],
  options: RunGenerationOptions = {}
): Promise<{ generationId: string }> {
  const generationStartedAt = Date.now();
  let creditConsumed = false;

  logGenerationEvent("info", "generation_pipeline_started", {
    projectId: project.id,
    projectName: project.name,
    userId: project.user_id,
    uploadCount: uploads.length
  });

  const { supabase, generation } = await createQueuedGeneration(project.id);

  try {
    const { plan, subscription } = await consumeForGeneration(project.user_id, {
      generationId: generation.id,
      projectId: project.id,
      apiKeyId: options.apiKeyId
    });
    creditConsumed = true;

    logGenerationEvent("info", "generation_credit_consumed", {
      projectId: project.id,
      generationId: generation.id,
      userId: project.user_id,
      plan: plan.id,
      creditsRemaining: subscription.credits_remaining
    });

    await trackGenerationStarted(project, generation.id);
    await markGenerationAnalyzing(supabase, generation.id);

    const safePlan = await planAssets(supabase, project, uploads, generation.id);
    const { deterministicAssets, renderedAssets, renderSources, qualityFailures, qualityWarnings } = await renderAssets(project, safePlan, uploads);
    const { zipUrl } = await persistAssetsAndZip({
      supabase,
      project,
      generationId: generation.id,
      plan,
      safePlan,
      renderedAssets,
      qualityFailures
    });

    await finalizeGeneration({
      supabase,
      project,
      generationId: generation.id,
      safePlan,
      zipUrl,
      renderSources,
      qualityWarnings,
      generationStartedAt,
      assetCount: deterministicAssets.length
    });

    logGenerationEvent("info", "generation_pipeline_completed", {
      projectId: project.id,
      generationId: generation.id,
      assetCount: deterministicAssets.length,
      renderSources,
      qualityWarningCount: qualityWarnings.length,
      durationMs: Date.now() - generationStartedAt
    });

    return { generationId: generation.id };
  } catch (error) {
    logGenerationError("generation_pipeline_failed", error, {
      projectId: project.id,
      generationId: generation.id,
      userId: project.user_id,
      creditConsumed,
      durationMs: Date.now() - generationStartedAt
    });

    return failGeneration({
      supabase,
      project,
      generationId: generation.id,
      error,
      creditConsumed,
      generationStartedAt,
      refundCredit: (reason) => refundForGeneration(project.user_id, reason, generation.id)
    });
  }
}

export async function rerenderSingleAsset(assetId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: asset, error } = await supabase.from("assets").select("*").eq("id", assetId).single();
  if (error || !asset) throw new Error("Asset not found");
  return asset;
}