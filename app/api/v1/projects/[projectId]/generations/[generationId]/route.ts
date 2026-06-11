import { NextResponse } from "next/server";
import { requireLaunchPixApiKey } from "@/lib/api-key";
import { requireApiUserId } from "@/lib/api-user";
import { getProjectOverview } from "@/lib/services/projects/queries";
import { getGenerationAssets, getGenerationForProject } from "@/lib/services/generations/queries";
import { mapGenerationToPublicStatus } from "@/lib/services/generations/status";
import type { AssetRecord, GenerationRecord } from "@/types/project";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; generationId: string }> }
) {
  const unauthorized = requireLaunchPixApiKey(_request);
  if (unauthorized) return unauthorized;

  const userResult = requireApiUserId(_request);
  if ("response" in userResult) return userResult.response;

  const { projectId, generationId } = await params;

  await getProjectOverview(projectId, userResult.userId);

  const generation = (await getGenerationForProject(projectId, generationId)) as GenerationRecord | null;
  if (!generation) {
    return NextResponse.json({ error: "Generation not found." }, { status: 404 });
  }

  const assets = (await getGenerationAssets(generationId)) as AssetRecord[];
  return NextResponse.json(mapGenerationToPublicStatus(generation, assets));
}