import type { SupabaseClient } from "@supabase/supabase-js";

export type EnqueueGenerationJobInput = {
  supabase: SupabaseClient;
  generationId: string;
  projectId: string;
  userId: string;
  attempt?: number;
};

export type EnqueueGenerationJobResult = {
  generationId: string;
  projectId: string;
  userId: string;
  status: "queued";
  attempt: number;
  enqueuedAt: string;
};

/**
 * Durable enqueue contract for Day 14 worker integration.
 * Source of truth: generations row with status "queued".
 * Audit trail: usage_events.generation_job_enqueued (no background promises).
 */
export async function enqueueGenerationJob(input: EnqueueGenerationJobInput): Promise<EnqueueGenerationJobResult> {
  const { supabase, generationId, projectId, userId, attempt = 1 } = input;
  const enqueuedAt = new Date().toISOString();

  const { data: generation, error: loadError } = await supabase
    .from("generations")
    .select("id, status, project_id")
    .eq("id", generationId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (loadError) throw new Error(loadError.message);
  if (!generation) throw new Error("Generation record not found for enqueue.");
  if (generation.status !== "queued") {
    throw new Error(`Generation is not enqueueable (status: ${generation.status}).`);
  }

  const { error: enqueueError } = await supabase.from("usage_events").insert({
    user_id: userId,
    project_id: projectId,
    event_type: "generation_job_enqueued",
    metadata_json: {
      generationId,
      attempt,
      enqueuedAt,
      integration: "day14_worker_claim"
    }
  });

  if (enqueueError) throw new Error(enqueueError.message);

  return {
    generationId,
    projectId,
    userId,
    status: "queued",
    attempt,
    enqueuedAt
  };
}