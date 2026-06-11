import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

describe("internal worker process route", () => {
  it("requires worker secret instead of public API key", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../../../app/api/internal/worker/generations/process/route.ts", import.meta.url)),
      "utf8"
    );

    assert.equal(source.includes("requireLaunchPixWorkerSecret"), true);
    assert.equal(source.includes("requireLaunchPixApiKey"), false);
  });

  it("returns the batch response shape and guards disabled async mode", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../../../app/api/internal/worker/generations/process/route.ts", import.meta.url)),
      "utf8"
    );

    assert.equal(source.includes("EMPTY_WORKER_BATCH_RESULT"), true);
    assert.equal(source.includes("canRunGenerationWorker"), true);
    assert.equal(source.includes("runGenerationWorkerBatch"), true);
    assert.equal(source.includes("getGenerationWorkerBatchLimit"), true);
  });
});