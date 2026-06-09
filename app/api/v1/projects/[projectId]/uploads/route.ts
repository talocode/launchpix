import { NextResponse } from "next/server";
import { requireLaunchPixApiKey } from "@/lib/api-key";
import { requireApiUserId } from "@/lib/api-user";
import { uploadMetadataSchema } from "@/lib/validation/project";
import { enqueueNormalization } from "@/lib/services/uploads/normalization";
import { trackEvent } from "@/lib/services/analytics/events";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const unauthorized = requireLaunchPixApiKey(req);
  if (unauthorized) return unauthorized;

  const userResult = requireApiUserId(req);
  if ("response" in userResult) return userResult.response;

  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: project } = await supabase.from("projects").select("id,name").eq("id", projectId).eq("user_id", userResult.userId).single();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  const position = Number(form.get("position") ?? 0);

  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });

  const metaParse = uploadMetadataSchema.safeParse({
    originalFilename: file.name,
    mimeType: file.type,
    fileSize: file.size,
    position
  });

  if (!metaParse.success) return NextResponse.json({ error: metaParse.error.issues[0]?.message }, { status: 400 });

  const bucket = process.env.STORAGE_BUCKET_UPLOADS || "project-uploads-raw";
  const path = `${userResult.userId}/${projectId}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);

  const { data, error } = await supabase
    .from("uploads")
    .insert({
      project_id: projectId,
      file_url: pub.publicUrl,
      original_filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      position
    })
    .select("*")
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message || "Could not save upload" }, { status: 500 });

  await enqueueNormalization(data.id);
  await trackEvent({ userId: userResult.userId, projectId, eventType: "screenshots_uploaded", metadata: { uploadId: data.id, projectName: project.name } });

  return NextResponse.json({ upload: data }, { status: 201 });
}
