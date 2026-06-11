import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  canRunGenerationWorker,
  getGenerationWorkerBatchLimit,
  isAsyncGenerationEnabled,
  isInlineGenerationWorkerEnabled,
  isManualGenerationWorkerAllowed
} from "./config";

const originalAsync = process.env.LAUNCHPIX_ASYNC_GENERATION;
const originalInline = process.env.LAUNCHPIX_GENERATION_WORKER_INLINE;
const originalManual = process.env.LAUNCHPIX_GENERATION_WORKER_ALLOW_MANUAL;
const originalBatchLimit = process.env.LAUNCHPIX_GENERATION_WORKER_BATCH_LIMIT;

afterEach(() => {
  if (originalAsync === undefined) delete process.env.LAUNCHPIX_ASYNC_GENERATION;
  else process.env.LAUNCHPIX_ASYNC_GENERATION = originalAsync;

  if (originalInline === undefined) delete process.env.LAUNCHPIX_GENERATION_WORKER_INLINE;
  else process.env.LAUNCHPIX_GENERATION_WORKER_INLINE = originalInline;

  if (originalManual === undefined) delete process.env.LAUNCHPIX_GENERATION_WORKER_ALLOW_MANUAL;
  else process.env.LAUNCHPIX_GENERATION_WORKER_ALLOW_MANUAL = originalManual;

  if (originalBatchLimit === undefined) delete process.env.LAUNCHPIX_GENERATION_WORKER_BATCH_LIMIT;
  else process.env.LAUNCHPIX_GENERATION_WORKER_BATCH_LIMIT = originalBatchLimit;
});

describe("generation config", () => {
  it("defaults async generation to disabled for production-safe sync POST", () => {
    delete process.env.LAUNCHPIX_ASYNC_GENERATION;
    assert.equal(isAsyncGenerationEnabled(), false);
  });

  it("enables async generation only with an explicit env flag", () => {
    process.env.LAUNCHPIX_ASYNC_GENERATION = "true";
    assert.equal(isAsyncGenerationEnabled(), true);
  });

  it("enables inline worker only with an explicit env flag", () => {
    delete process.env.LAUNCHPIX_GENERATION_WORKER_INLINE;
    assert.equal(isInlineGenerationWorkerEnabled(), false);

    process.env.LAUNCHPIX_GENERATION_WORKER_INLINE = "true";
    assert.equal(isInlineGenerationWorkerEnabled(), true);
  });

  it("defaults worker batch limit to 5 and caps oversized values", () => {
    delete process.env.LAUNCHPIX_GENERATION_WORKER_BATCH_LIMIT;
    assert.equal(getGenerationWorkerBatchLimit(), 5);

    process.env.LAUNCHPIX_GENERATION_WORKER_BATCH_LIMIT = "99";
    assert.equal(getGenerationWorkerBatchLimit(), 20);

    process.env.LAUNCHPIX_GENERATION_WORKER_BATCH_LIMIT = "0";
    assert.equal(getGenerationWorkerBatchLimit(), 5);
  });

  it("blocks worker runs when async is disabled unless manual force is allowed", () => {
    delete process.env.LAUNCHPIX_ASYNC_GENERATION;
    delete process.env.LAUNCHPIX_GENERATION_WORKER_ALLOW_MANUAL;

    assert.equal(canRunGenerationWorker(), false);
    assert.equal(canRunGenerationWorker({ force: true }), false);

    process.env.LAUNCHPIX_GENERATION_WORKER_ALLOW_MANUAL = "true";
    assert.equal(canRunGenerationWorker({ force: true }), true);
  });

  it("exposes manual worker allowance only with an explicit env flag", () => {
    delete process.env.LAUNCHPIX_GENERATION_WORKER_ALLOW_MANUAL;
    assert.equal(isManualGenerationWorkerAllowed(), false);

    process.env.LAUNCHPIX_GENERATION_WORKER_ALLOW_MANUAL = "true";
    assert.equal(isManualGenerationWorkerAllowed(), true);
  });
});