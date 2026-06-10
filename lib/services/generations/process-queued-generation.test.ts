import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

describe("processQueuedGeneration module boundaries", () => {
  it("claims queued generations and reuses the split pipeline modules", () => {
    const source = readFileSync(fileURLToPath(new URL("./process-queued-generation.ts", import.meta.url)), "utf8");

    assert.equal(source.includes("claimGenerationForProcessing"), true);
    assert.equal(source.includes("planAssets"), true);
    assert.equal(source.includes("renderAssets"), true);
    assert.equal(source.includes("persistAssetsAndZip"), true);
    assert.equal(source.includes("finalizeGeneration"), true);
  });

  it("does not reserve credits because async submit already consumed them", () => {
    const source = readFileSync(fileURLToPath(new URL("./process-queued-generation.ts", import.meta.url)), "utf8");

    assert.equal(source.includes("consumeForGeneration"), false);
    assert.equal(source.includes("createQueuedGeneration"), false);
    assert.equal(source.includes("createPendingGeneration"), false);
    assert.equal(source.includes("creditConsumed: true"), true);
  });
});