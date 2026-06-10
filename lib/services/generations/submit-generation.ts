import type { ProjectRecord } from "@/types/project";
import { consumeForGeneration, refundForGeneration } from "@/lib/services/generations/billing";
import { createQueuedGeneration } from "@/lib/services/generations/create-generation";
import { enqueueGenerationJob } from "@/lib/services/generations/enqueue";
import { buildAcceptedGenerationResponse, type AcceptedGenerationResponse } from "@/lib/services/generations/enqueue-response";
import { failGeneration, trackGenerationStarted } from "@/lib/services/generations/finalize";

export async function submitGenerationRequest(project: ProjectRecord): Promise<AcceptedGenerationResponse> {
  const generationStartedAt = Date.now();
  let creditConsumed = false;

  const { supabase, generation } = await createQueuedGeneration(project.id);

  try {
    await consumeForGeneration(project.user_id);
    creditConsumed = true;

    await enqueueGenerationJob({
      supabase,
      generationId: generation.id,
      projectId: project.id,
      userId: project.user_id
    });

    await trackGenerationStarted(project, generation.id);

    return buildAcceptedGenerationResponse(project.id, generation.id);
  } catch (error) {
    return failGeneration({
      supabase,
      project,
      generationId: generation.id,
      error,
      creditConsumed,
      generationStartedAt,
      refundCredit: (reason) => refundForGeneration(project.user_id, reason, generation.id)
    });
  }
}