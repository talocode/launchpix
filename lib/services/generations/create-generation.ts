import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function insertGeneration(projectId: string, status: "draft" | "queued") {
  const supabase = await createSupabaseServerClient();
  const { data: generation, error: generationError } = await supabase
    .from("generations")
    .insert({ project_id: projectId, status })
    .select("*")
    .single();

  if (generationError || !generation) {
    throw new Error(generationError?.message || "Failed to create generation record");
  }

  return { supabase, generation };
}

/** Non-claimable row for async submit: billing must succeed before promotion to queued. */
export async function createPendingGeneration(projectId: string) {
  return insertGeneration(projectId, "draft");
}

/** Sync runner path: row starts queued because work begins immediately in-request. */
export async function createQueuedGeneration(projectId: string) {
  return insertGeneration(projectId, "queued");
}

export async function promoteGenerationToQueued(supabase: SupabaseClient, generationId: string) {
  const { data: generation, error } = await supabase
    .from("generations")
    .update({ status: "queued" })
    .eq("id", generationId)
    .eq("status", "draft")
    .select("*")
    .single();

  if (error || !generation) {
    throw new Error(error?.message || "Failed to promote generation to queued.");
  }

  return generation;
}

export async function markProjectQueued(supabase: SupabaseClient, projectId: string) {
  const { error } = await supabase.from("projects").update({ status: "queued" }).eq("id", projectId);
  if (error) throw new Error(error.message);
}