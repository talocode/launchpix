import { NextResponse } from "next/server";
import { requireLaunchPixApiKey } from "@/lib/api-key";
import { requireApiUserId } from "@/lib/api-user";
import { createProjectSchema } from "@/lib/validation/project";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const unauthorized = requireLaunchPixApiKey(request);
  if (unauthorized) return unauthorized;

  const userResult = requireApiUserId(request);
  if ("response" in userResult) return userResult.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,product_type,platform,status,created_at,updated_at")
    .eq("user_id", userResult.userId)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data ?? [] });
}

export async function POST(request: Request) {
  const unauthorized = requireLaunchPixApiKey(request);
  if (unauthorized) return unauthorized;

  const userResult = requireApiUserId(request);
  if ("response" in userResult) return userResult.response;

  const body = await request.json().catch(() => null);
  const parsed = createProjectSchema.safeParse({ ...body, userId: userResult.userId });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const payload = {
    user_id: userResult.userId,
    name: parsed.data.name,
    product_type: parsed.data.productType,
    platform: parsed.data.platform,
    description: parsed.data.description,
    audience: parsed.data.audience,
    website_url: parsed.data.websiteUrl || null,
    primary_color: parsed.data.primaryColor,
    style_preset: parsed.data.stylePreset,
    status: "ready"
  };

  const { data: project, error } = await supabase.from("projects").insert(payload).select("*").single();
  if (error || !project) return NextResponse.json({ error: error?.message ?? "Unable to create project." }, { status: 500 });

  const { data: draft } = await supabase.from("generations").select("id").eq("project_id", project.id).eq("status", "draft").maybeSingle();
  if (!draft) {
    const { error: generationError } = await supabase.from("generations").insert({ project_id: project.id, status: "draft" });
    if (generationError) return NextResponse.json({ error: generationError.message }, { status: 500 });
  }

  return NextResponse.json({ project }, { status: 201 });
}

