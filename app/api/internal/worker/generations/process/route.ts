import { NextResponse } from "next/server";
import { canRunGenerationWorker, getGenerationWorkerBatchLimit } from "@/lib/services/generations/config";
import { EMPTY_WORKER_BATCH_RESULT, runGenerationWorkerBatch } from "@/lib/services/generations/worker-batch";
import { requireLaunchPixWorkerSecret } from "@/lib/services/generations/worker-auth";

type ProcessGenerationBody = {
  generationId?: string;
  projectId?: string;
  workerId?: string;
  limit?: number;
  force?: boolean;
};

function emptyBatchResponse(status: number, error?: string) {
  return NextResponse.json(
    {
      ...EMPTY_WORKER_BATCH_RESULT,
      ...(error ? { error } : {})
    },
    { status }
  );
}

export async function POST(request: Request) {
  const unauthorized = requireLaunchPixWorkerSecret(request);
  if (unauthorized) return unauthorized;

  let body: ProcessGenerationBody = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === "object") {
      body = parsed as ProcessGenerationBody;
    }
  } catch {
    body = {};
  }

  if (!canRunGenerationWorker({ force: body.force === true })) {
    return emptyBatchResponse(503, "Async generation is disabled. Enable LAUNCHPIX_ASYNC_GENERATION or pass force with manual worker access.");
  }

  const requestedLimit = typeof body.limit === "number" ? body.limit : undefined;
  const limit = Math.min(requestedLimit ?? getGenerationWorkerBatchLimit(), getGenerationWorkerBatchLimit());

  const targets =
    body.generationId && body.projectId
      ? [{ generationId: body.generationId, projectId: body.projectId }]
      : undefined;

  try {
    const result = await runGenerationWorkerBatch({
      workerId: body.workerId ?? "generation-worker",
      limit,
      targets
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation worker failed.";
    return emptyBatchResponse(500, message);
  }
}