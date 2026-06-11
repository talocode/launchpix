import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGenerationWorkerBatchLimit } from "@/lib/services/generations/config";
import { processQueuedGeneration } from "@/lib/services/generations/process-queued-generation";
import { listQueuedGenerations, type QueuedGenerationTarget } from "@/lib/services/generations/queries";

export type GenerationWorkerBatchResult = {
  processed: number;
  claimed: number;
  completed: number;
  failed: number;
  skipped: number;
};

export const EMPTY_WORKER_BATCH_RESULT: GenerationWorkerBatchResult = {
  processed: 0,
  claimed: 0,
  completed: 0,
  failed: 0,
  skipped: 0
};

type RunGenerationWorkerBatchInput = {
  workerId?: string;
  limit?: number;
  targets?: QueuedGenerationTarget[];
};

export async function runGenerationWorkerBatch(input: RunGenerationWorkerBatchInput = {}): Promise<GenerationWorkerBatchResult> {
  const supabase = await createSupabaseServerClient();
  const limit = Math.min(input.limit ?? getGenerationWorkerBatchLimit(), getGenerationWorkerBatchLimit());
  const targets = input.targets ?? (await listQueuedGenerations(supabase, limit));

  const result: GenerationWorkerBatchResult = { ...EMPTY_WORKER_BATCH_RESULT };

  for (const target of targets) {
    result.processed += 1;

    try {
      const outcome = await processQueuedGeneration({
        generationId: target.generationId,
        projectId: target.projectId,
        workerId: input.workerId
      });

      if (outcome.processed) {
        result.claimed += 1;
        result.completed += 1;
        continue;
      }

      result.skipped += 1;
    } catch {
      result.claimed += 1;
      result.failed += 1;
    }
  }

  return result;
}