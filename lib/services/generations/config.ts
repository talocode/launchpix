const DEFAULT_WORKER_BATCH_LIMIT = 5;
const MAX_WORKER_BATCH_LIMIT = 20;

export function isAsyncGenerationEnabled(): boolean {
  return process.env.LAUNCHPIX_ASYNC_GENERATION === "true";
}

/** Process queued jobs in the same request after 202 acceptance (dev/single-node). */
export function isInlineGenerationWorkerEnabled(): boolean {
  return process.env.LAUNCHPIX_GENERATION_WORKER_INLINE === "true";
}

export function isManualGenerationWorkerAllowed(): boolean {
  return process.env.LAUNCHPIX_GENERATION_WORKER_ALLOW_MANUAL === "true";
}

export function getGenerationWorkerBatchLimit(): number {
  const raw = process.env.LAUNCHPIX_GENERATION_WORKER_BATCH_LIMIT;
  if (!raw) return DEFAULT_WORKER_BATCH_LIMIT;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_WORKER_BATCH_LIMIT;

  return Math.min(parsed, MAX_WORKER_BATCH_LIMIT);
}

export function canRunGenerationWorker(options?: { force?: boolean }): boolean {
  if (isAsyncGenerationEnabled()) return true;
  return Boolean(options?.force && isManualGenerationWorkerAllowed());
}