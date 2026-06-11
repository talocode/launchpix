import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAcceptedGenerationResponse } from "./enqueue-response";

describe("buildAcceptedGenerationResponse", () => {
  it("returns 202 polling payload with generationId and poll path", () => {
    const response = buildAcceptedGenerationResponse("proj-1", "gen-1");

    assert.deepEqual(response, {
      generationId: "gen-1",
      status: "queued",
      poll: "/api/v1/projects/proj-1/generations/gen-1"
    });
  });
});