import type { ProjectRecord, UploadRecord } from "@/types/project";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PLAN_CONFIG } from "@/lib/services/billing/plans";
import { getUserBillingState, refundForGeneration } from "@/lib/services/generations/billing";
import { claimGenerationForProcessing, type ClaimGenerationFailureReason } from "@/lib/services/generations/claim";
import { failGeneration, finalizeGeneration } from "@/lib/services/generations/finalize";
import { logGenerationError, logGenerationEvent } from "@/lib/services/generations/logging";
import { planAssets } from "@/lib/services/generations/planner";
import { renderAssets } from "@/lib/services/generations/renderer";
import { persistAssetsAndZip } from "@/lib/services/generations/storage";

export type ProcessQueuedGenerationResult =
  | { processed: true; generationId: string }
  | { processed: false; reason: ClaimGenerationFailureReason };

type ProcessQueuedGenerationInput = {
  generationId: string;
  projectId: string;
  workerId?: string;
};

async function loadProjectContext(supabase: SupabaseClient, projectId: string) {
  const { data: project, error: projectError } = await supabase.from("projects").select("*").eq("id", projectId).single();
  if (projectError || !project) throw new Error("Project not found for queued generation.");

  const { data: uploads, error: uploadsError } = await supabase
    .from("uploads")
    .select("*")
    .eq("project_id", projectId)
    .order("position");

  if (uploadsError) throw new Error(uploadsError.message);

  return {
    project: project as ProjectRecord,
    uploads: (uploads ?? []) as UploadRecord[]
  };
}

export async function processQueuedGeneration(input: ProcessQueuedGenerationInput): Promise<ProcessQueuedGenerationResult> {
  const supabase = await createSupabaseServerClient();
  const generationStartedAt = Date.now();

  const claim = await claimGenerationForProcessing({
    supabase,
    generationId: input.generationId,
    workerId: input.workerId
  });

  if (!claim.claimed) {
    return { processed: false, reason: claim.reason };
  }

  const { project, uploads } = await loadProjectContext(supabase, input.projectId);

  logGenerationEvent("info", "generation_worker_started", {
    projectId: project.id,
    generationId: input.generationId,
    workerId: input.workerId ?? null,
    uploadCount: uploads.length
  });

  if (!uploads.length) {
    const error = new Error("At least one screenshot is required.");
    logGenerationError("generation_worker_failed", error, {
      projectId: project.id,
      generationId: input.generationId,
      reason: "missing_uploads"
    });

    return failGeneration({
      supabase,
      project,
      generationId: input.generationId,
      error,
      creditConsumed: true,
      generationStartedAt,
      refundCredit: (reason) => refundForGeneration(project.user_id, reason, input.generationId)
    });
  }

  try {
    const subscription = await getUserBillingState(project.user_id);
    const plan = PLAN_CONFIG[(subscription.plan as keyof typeof PLAN_CONFIG) || "credits"] || PLAN_CONFIG.credits;

    const safePlan = await planAssets(supabase, project, uploads, input.generationId);
    const { deterministicAssets, renderedAssets, renderSources, qualityFailures, qualityWarnings } = await renderAssets(
      project,
      safePlan,
      uploads
    );
    const { zipUrl } = await persistAssetsAndZip({
      supabase,
      project,
      generationId: input.generationId,
      plan,
      safePlan,
      renderedAssets,
      qualityFailures
    });

    await finalizeGeneration({
      supabase,
      project,
      generationId: input.generationId,
      safePlan,
      zipUrl,
      renderSources,
      qualityWarnings,
      generationStartedAt,
      assetCount: deterministicAssets.length
    });

    logGenerationEvent("info", "generation_worker_completed", {
      projectId: project.id,
      generationId: input.generationId,
      assetCount: deterministicAssets.length,
      durationMs: Date.now() - generationStartedAt
    });

    return { processed: true, generationId: input.generationId };
  } catch (error) {
    logGenerationError("generation_worker_failed", error, {
      projectId: project.id,
      generationId: input.generationId,
      durationMs: Date.now() - generationStartedAt
    });

    return failGeneration({
      supabase,
      project,
      generationId: input.generationId,
      error,
      creditConsumed: true,
      generationStartedAt,
      refundCredit: (reason) => refundForGeneration(project.user_id, reason, input.generationId)
    });
  }
}