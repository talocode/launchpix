import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

describe("v1 generate route generation modes", () => {
  it("defaults to the sync runner until async generation is explicitly enabled", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../../../app/api/v1/projects/[projectId]/generate/route.ts", import.meta.url)),
      "utf8"
    );

    assert.equal(source.includes("isAsyncGenerationEnabled"), true);
    assert.equal(source.includes("runGenerationForProject"), true);
    assert.equal(source.includes('status: "completed"'), true);
    assert.equal(source.includes("status: 201"), true);
  });

  it("wires the queued worker only on the async path", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../../../app/api/v1/projects/[projectId]/generate/route.ts", import.meta.url)),
      "utf8"
    );

    const asyncIndex = source.indexOf("submitGenerationRequest");
    const inlineWorkerIndex = source.indexOf("processQueuedGeneration");

    assert.ok(asyncIndex >= 0);
    assert.ok(inlineWorkerIndex > asyncIndex);
    assert.equal(source.includes("isInlineGenerationWorkerEnabled"), true);
  });
});