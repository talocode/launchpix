import { NextResponse } from "next/server";
import { authenticateApiCustomerRequest } from "@/lib/services/api-keys/authenticate-api-key";
import { getProjectOverviewForApi } from "@/lib/services/projects/api-queries";
import { getGenerationAssets, getGenerationForProject } from "@/lib/services/generations/queries";
import { mapGenerationToPublicStatus } from "@/lib/services/generations/status";
import type { AssetRecord, GenerationRecord } from "@/types/project";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; generationId: string }> }
) {
  const authResult = await authenticateApiCustomerRequest(request);
  if ("response" in authResult) return authResult.response;

  const { projectId, generationId } = await params;

  const overview = await getProjectOverviewForApi(projectId, authResult.customer.userId);
  if (!overview) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const generation = (await getGenerationForProject(projectId, generationId)) as GenerationRecord | null;
  if (!generation) {
    return NextResponse.json({ error: "Generation not found." }, { status: 404 });
  }

  const assets = (await getGenerationAssets(generationId)) as AssetRecord[];
  return NextResponse.json(mapGenerationToPublicStatus(generation, assets));
}