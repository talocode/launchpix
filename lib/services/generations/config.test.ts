import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { isAsyncGenerationEnabled, isInlineGenerationWorkerEnabled } from "./config";

const originalAsync = process.env.LAUNCHPIX_ASYNC_GENERATION;
const originalInline = process.env.LAUNCHPIX_GENERATION_WORKER_INLINE;

afterEach(() => {
  if (originalAsync === undefined) delete process.env.LAUNCHPIX_ASYNC_GENERATION;
  else process.env.LAUNCHPIX_ASYNC_GENERATION = originalAsync;

  if (originalInline === undefined) delete process.env.LAUNCHPIX_GENERATION_WORKER_INLINE;
  else process.env.LAUNCHPIX_GENERATION_WORKER_INLINE = originalInline;
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
});