import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { buildAcceptedGenerationResponse } from "./enqueue-response";

describe("submitGenerationRequest module boundaries", () => {
  it("does not import sync execution modules (runner/renderer/planner/storage)", () => {
    const source = readFileSync(fileURLToPath(new URL("./submit-generation.ts", import.meta.url)), "utf8");

    assert.equal(source.includes("runGenerationForProject"), false);
    assert.equal(source.includes("renderAssets"), false);
    assert.equal(source.includes("planAssets"), false);
    assert.equal(source.includes("persistAssetsAndZip"), false);
    assert.equal(source.includes("mistral"), false);
  });

  it("uses the accepted 202 response contract", () => {
    const response = buildAcceptedGenerationResponse("proj-1", "gen-1");
    assert.equal(response.status, "queued");
    assert.match(response.poll, /\/api\/v1\/projects\/proj-1\/generations\/gen-1$/);
  });

  it("reserves credit before promoting generation to claimable queued", () => {
    const source = readFileSync(fileURLToPath(new URL("./submit-generation.ts", import.meta.url)), "utf8");
    const consumeIndex = source.indexOf("consumeForGeneration");
    const promoteIndex = source.indexOf("promoteGenerationToQueued");
    const enqueueIndex = source.indexOf("enqueueGenerationJob");

    assert.ok(consumeIndex >= 0);
    assert.ok(promoteIndex > consumeIndex);
    assert.ok(enqueueIndex > promoteIndex);
    assert.equal(source.includes("createPendingGeneration"), true);
  });

  it("marks the project queued before returning 202", () => {
    const source = readFileSync(fileURLToPath(new URL("./submit-generation.ts", import.meta.url)), "utf8");
    const projectQueuedIndex = source.indexOf("markProjectQueued");
    const returnIndex = source.indexOf("buildAcceptedGenerationResponse");

    assert.ok(projectQueuedIndex >= 0);
    assert.ok(returnIndex > projectQueuedIndex);
  });
});