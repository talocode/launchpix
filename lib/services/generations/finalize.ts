import type { GenerationPlan } from "@/lib/ai/schemas/asset-plan";
import { trackEvent } from "@/lib/services/analytics/events";
import type { ProjectRecord } from "@/types/project";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { QualityFailureDetail } from "@/lib/services/generations/renderer";

export async function trackGenerationStarted(project: ProjectRecord, generationId: string) {
  await trackEvent({
    userId: project.user_id,
    projectId: project.id,
    eventType: "generation_started",
    metadata: { generationId, projectName: project.name }
  });
}

export type FinalizeGenerationInput = {
  supabase: SupabaseClient;
  project: ProjectRecord;
  generationId: string;
  safePlan: GenerationPlan;
  zipUrl: string;
  renderSources: Record<string, number>;
  qualityWarnings: QualityFailureDetail[];
  generationStartedAt: number;
  assetCount: number;
};

export async function finalizeGeneration(input: FinalizeGenerationInput) {
  const { supabase, project, generationId, safePlan, zipUrl, renderSources, qualityWarnings, generationStartedAt, assetCount } = input;

  await supabase
    .from("generations")
    .update({
      status: "completed",
      style_json: { ...safePlan, zip_url: zipUrl, render_sources: renderSources, quality_warnings: qualityWarnings }
    })
    .eq("id", generationId);
  await supabase.from("projects").update({ status: "completed" }).eq("id", project.id);

  if (qualityWarnings.length) {
    await trackEvent({
      userId: project.user_id,
      projectId: project.id,
      eventType: "quality_warning",
      metadata: {
        generationId,
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
      generationId,
      projectName: project.name,
      duration_ms: Date.now() - generationStartedAt,
      render_sources: renderSources,
      assets: assetCount
    }
  });
}

export type FailGenerationInput = {
  supabase: SupabaseClient;
  project: ProjectRecord;
  generationId: string;
  error: unknown;
  creditConsumed: boolean;
  generationStartedAt: number;
  refundCredit: (reason: string) => Promise<void>;
};

export async function failGeneration(input: FailGenerationInput): Promise<never> {
  const { supabase, project, generationId, error, creditConsumed, generationStartedAt, refundCredit } = input;
  const message = error instanceof Error ? error.message : "Generation failed";
  let creditRefunded = false;

  try {
    if (!creditConsumed) throw new Error("No reserved generation credit to refund.");
    await refundCredit(message);
    creditRefunded = true;
  } catch (refundError) {
    if (creditConsumed) {
      console.error("Failed to refund generation credit:", refundError instanceof Error ? refundError.message : refundError);
    }
  }

  await supabase.from("generations").update({ status: "failed", error_message: message }).eq("id", generationId);
  await supabase.from("projects").update({ status: "failed" }).eq("id", project.id);
  await trackEvent({
    userId: project.user_id,
    projectId: project.id,
    eventType: "generation_failed",
    metadata: {
      generationId,
      projectName: project.name,
      message,
      credit_refunded: creditRefunded,
      duration_ms: Date.now() - generationStartedAt
    }
  });

  throw error;
}