import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type QueuedGenerationTarget = {
  generationId: string;
  projectId: string;
};

export async function getLatestGeneration(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("generations")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getGenerationHistory(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("generations").select("id,status,created_at,error_message").eq("project_id", projectId).order("created_at", { ascending: false }).limit(10);
  return data ?? [];
}

export async function getGenerationForProject(projectId: string, generationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("id", generationId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function listQueuedGenerations(supabase: SupabaseClient, limit: number): Promise<QueuedGenerationTarget[]> {
  const { data, error } = await supabase
    .from("generations")
    .select("id, project_id")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((generation) => ({
    generationId: generation.id,
    projectId: generation.project_id
  }));
}

export async function getGenerationAssets(generationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("assets").select("*").eq("generation_id", generationId).order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}
