import { NextResponse } from "next/server";
import { requireLaunchPixApiKey } from "@/lib/api-key";
import { processQueuedGeneration } from "@/lib/services/generations/process-queued-generation";

type ProcessGenerationBody = {
  generationId?: string;
  projectId?: string;
  workerId?: string;
};

export async function POST(request: Request) {
  const unauthorized = requireLaunchPixApiKey(request);
  if (unauthorized) return unauthorized;

  let body: ProcessGenerationBody;
  try {
    body = (await request.json()) as ProcessGenerationBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { generationId, projectId, workerId } = body;
  if (!generationId || !projectId) {
    return NextResponse.json({ error: "generationId and projectId are required." }, { status: 400 });
  }

  try {
    const result = await processQueuedGeneration({ generationId, projectId, workerId });

    if (!result.processed) {
      const status = result.reason === "not_found" ? 404 : 409;
      return NextResponse.json({ processed: false, reason: result.reason }, { status });
    }

    return NextResponse.json({ processed: true, generationId: result.generationId }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation worker failed.";
    const status = message.toLowerCase().includes("no credits remaining") ? 402 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}