import { createSupabaseServerClient } from "@/lib/supabase/server";

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

export async function getGenerationAssets(generationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("assets").select("*").eq("generation_id", generationId).order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}
