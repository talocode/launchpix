import { NextResponse } from "next/server";
import { authenticateApiCustomerRequest } from "@/lib/services/api-keys/authenticate-api-key";
import { getProjectOverviewForApi } from "@/lib/services/projects/api-queries";
import { isAsyncGenerationEnabled, isInlineGenerationWorkerEnabled } from "@/lib/services/generations/config";
import { submitGenerationRequest } from "@/lib/services/generations/submit-generation";
import { processQueuedGeneration } from "@/lib/services/generations/process-queued-generation";
import { getLatestGeneration } from "@/lib/services/generations/queries";
import { runGenerationForProject } from "@/lib/services/generations/runner";
import { allowGenerationAttempt } from "@/lib/services/access/rate-limit";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const authResult = await authenticateApiCustomerRequest(request);
  if ("response" in authResult) return authResult.response;

  const { projectId } = await params;
  const overview = await getProjectOverviewForApi(projectId, authResult.customer.userId);
  if (!overview) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const generation = await getLatestGeneration(overview.project.id);
  return NextResponse.json({ generation });
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const authResult = await authenticateApiCustomerRequest(request);
  if ("response" in authResult) return authResult.response;

  if (!allowGenerationAttempt(authResult.customer.userId)) {
    return NextResponse.json({ error: "Too many generation attempts. Please wait and retry." }, { status: 429 });
  }

  const { projectId } = await params;
  const overview = await getProjectOverviewForApi(projectId, authResult.customer.userId);
  if (!overview) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const { project, uploads } = overview;
  if (!uploads.length) return NextResponse.json({ error: "At least one screenshot is required." }, { status: 400 });

  const billingOptions = { apiKeyId: authResult.customer.apiKeyId };

  if (!isAsyncGenerationEnabled()) {
    try {
      const { generationId } = await runGenerationForProject(project, uploads, billingOptions);
      return NextResponse.json({ generationId, status: "completed" }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed";
      const status = message.toLowerCase().includes("no credits remaining") ? 402 : 500;
      return NextResponse.json({ error: message }, { status });
    }
  }

  const response = await submitGenerationRequest(project, billingOptions);

  if (isInlineGenerationWorkerEnabled()) {
    await processQueuedGeneration({
      generationId: response.generationId,
      projectId: project.id
    });
  }

  return NextResponse.json(response, {
    status: 202,
    headers: {
      Location: response.poll
    }
  });
}