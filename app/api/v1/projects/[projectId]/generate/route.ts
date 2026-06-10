import { NextResponse } from "next/server";
import { requireLaunchPixApiKey } from "@/lib/api-key";
import { requireApiUserId } from "@/lib/api-user";
import { getProjectOverview } from "@/lib/services/projects/queries";
import { submitGenerationRequest } from "@/lib/services/generations/submit-generation";
import { getLatestGeneration } from "@/lib/services/generations/queries";
import { allowGenerationAttempt } from "@/lib/services/access/rate-limit";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const unauthorized = requireLaunchPixApiKey(request);
  if (unauthorized) return unauthorized;

  const userResult = requireApiUserId(request);
  if ("response" in userResult) return userResult.response;

  const { projectId } = await params;
  const { project } = await getProjectOverview(projectId, userResult.userId);
  const generation = await getLatestGeneration(project.id);
  return NextResponse.json({ generation });
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const unauthorized = requireLaunchPixApiKey(request);
  if (unauthorized) return unauthorized;

  const userResult = requireApiUserId(request);
  if ("response" in userResult) return userResult.response;

  if (!allowGenerationAttempt(userResult.userId)) {
    return NextResponse.json({ error: "Too many generation attempts. Please wait and retry." }, { status: 429 });
  }

  const { projectId } = await params;
  const { project, uploads } = await getProjectOverview(projectId, userResult.userId);
  if (!uploads.length) return NextResponse.json({ error: "At least one screenshot is required." }, { status: 400 });

  const response = await submitGenerationRequest(project);
  return NextResponse.json(response, {
    status: 202,
    headers: {
      Location: response.poll
    }
  });
}

