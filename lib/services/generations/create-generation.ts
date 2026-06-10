import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createQueuedGeneration(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: generation, error: generationError } = await supabase
    .from("generations")
    .insert({ project_id: projectId, status: "queued" })
    .select("*")
    .single();

  if (generationError || !generation) {
    throw new Error(generationError?.message || "Failed to create generation record");
  }

  return { supabase, generation };
}