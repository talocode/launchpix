import type { ProjectRecord } from "@/types/project";
import { consumeForGeneration, refundForGeneration } from "@/lib/services/generations/billing";
import { createPendingGeneration, markProjectQueued, promoteGenerationToQueued } from "@/lib/services/generations/create-generation";
import { enqueueGenerationJob } from "@/lib/services/generations/enqueue";
import { buildAcceptedGenerationResponse, type AcceptedGenerationResponse } from "@/lib/services/generations/enqueue-response";
import { failGeneration, trackGenerationStarted } from "@/lib/services/generations/finalize";

type SubmitGenerationOptions = {
  apiKeyId?: string;
};

export async function submitGenerationRequest(
  project: ProjectRecord,
  options: SubmitGenerationOptions = {}
): Promise<AcceptedGenerationResponse> {
  const generationStartedAt = Date.now();
  let creditConsumed = false;

  const { supabase, generation } = await createPendingGeneration(project.id);

  try {
    await consumeForGeneration(project.user_id, {
      generationId: generation.id,
      projectId: project.id,
      apiKeyId: options.apiKeyId
    });
    creditConsumed = true;

    const queuedGeneration = await promoteGenerationToQueued(supabase, generation.id);
    await markProjectQueued(supabase, project.id);

    await enqueueGenerationJob({
      supabase,
      generationId: queuedGeneration.id,
      projectId: project.id,
      userId: project.user_id
    });

    await trackGenerationStarted(project, queuedGeneration.id);

    return buildAcceptedGenerationResponse(project.id, queuedGeneration.id);
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