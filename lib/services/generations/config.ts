export function isAsyncGenerationEnabled(): boolean {
  return process.env.LAUNCHPIX_ASYNC_GENERATION === "true";
}

/** Process queued jobs in the same request after 202 acceptance (dev/single-node). */
export function isInlineGenerationWorkerEnabled(): boolean {
  return process.env.LAUNCHPIX_GENERATION_WORKER_INLINE === "true";
}