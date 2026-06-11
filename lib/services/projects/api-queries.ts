import type { ProjectRecord, UploadRecord } from "@/types/project";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getProjectOverviewForApi(projectId: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (projectError) throw new Error(projectError.message);
  if (!project) return null;

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