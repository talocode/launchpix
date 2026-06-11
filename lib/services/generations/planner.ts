import { mistralAdapter } from "@/lib/ai/generate-asset-plan";
import { createDeterministicGenerationPlan } from "@/lib/ai/mistral";
import { generationPlanSchema, type GenerationPlan } from "@/lib/ai/schemas/asset-plan";
import type { ProjectRecord, UploadRecord } from "@/types/project";
import type { SupabaseClient } from "@supabase/supabase-js";

function buildPlanningInput(project: ProjectRecord, uploads: UploadRecord[]) {
  return {
    project: {
      name: project.name,
      product_type: project.product_type,
      platform: project.platform,
      description: project.description,
      audience: project.audience,
      style_preset: project.style_preset,
      style_prompt: project.style_prompt
    },
    uploads: uploads.map((upload) => ({ id: upload.id, file_url: upload.file_url, position: upload.position }))
  };
}

export async function markGenerationAnalyzing(supabase: SupabaseClient, generationId: string) {
  await supabase.from("generations").update({ status: "analyzing" }).eq("id", generationId);
}

export async function planAssets(
  supabase: SupabaseClient,
  project: ProjectRecord,
  uploads: UploadRecord[],
  generationId: string
): Promise<GenerationPlan> {
  const planningInput = buildPlanningInput(project, uploads);

  const planResponse = await mistralAdapter.generateAssetPlan(planningInput).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("AI planning failed; continuing with deterministic plan:", message);
    return createDeterministicGenerationPlan(planningInput);
  });

  const safePlan = generationPlanSchema.parse(planResponse);

  await supabase
    .from("generations")
    .update({ status: "generating_copy", ai_summary: safePlan, copy_json: safePlan, style_json: safePlan })
    .eq("id", generationId);

  await supabase.from("generations").update({ status: "rendering_assets" }).eq("id", generationId);

  return safePlan;
}