import type { ProjectRecord, UploadRecord } from "@/types/project";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isInvalidUuidLookupError(error: { code?: string; message?: string }) {
  if (error.code === "22P02") return true;
  return /invalid input syntax for type uuid/i.test(error.message ?? "");
}

export async function getProjectOverviewForApi(projectId: string, userId: string) {
  if (!UUID_PATTERN.test(projectId)) return null;

  const supabase = await createSupabaseServerClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (projectError) {
    if (isInvalidUuidLookupError(projectError)) return null;
    throw new Error(projectError.message);
  }
  if (!project) return null;

  const { data: uploads, error: uploadsError } = await supabase
    .from("uploads")
    .select("*")
    .eq("project_id", projectId)
    .order("position");

  if (uploadsError) {
    if (isInvalidUuidLookupError(uploadsError)) return null;
    throw new Error(uploadsError.message);
  }

  return {
    project: project as ProjectRecord,
    uploads: (uploads ?? []) as UploadRecord[]
  };
}