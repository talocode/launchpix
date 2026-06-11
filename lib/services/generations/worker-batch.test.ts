import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EMPTY_WORKER_BATCH_RESULT } from "./worker-batch";

describe("generation worker batch", () => {
  it("exposes the production batch response shape", () => {
    assert.deepEqual(EMPTY_WORKER_BATCH_RESULT, {
      processed: 0,
      claimed: 0,
      completed: 0,
      failed: 0,
      skipped: 0
    });
  });
});