import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

describe("generation billing boundaries", () => {
  it("charges credits once on sync runner POST path with generation context", () => {
    const runnerSource = readFileSync(fileURLToPath(new URL("./runner.ts", import.meta.url)), "utf8");
    const generateRouteSource = readFileSync(
      fileURLToPath(new URL("../../../app/api/v1/projects/[projectId]/generate/route.ts", import.meta.url)),
      "utf8"
    );

    assert.equal(runnerSource.includes("consumeForGeneration(project.user_id, {"), true);
    assert.equal(runnerSource.includes("generationId: generation.id"), true);
    assert.equal(runnerSource.includes("apiKeyId: options.apiKeyId"), true);
    assert.equal(generateRouteSource.includes("apiKeyId: authResult.customer.apiKeyId"), true);
  });

  it("charges credits once on async submit path before enqueue", () => {
    const submitSource = readFileSync(fileURLToPath(new URL("./submit-generation.ts", import.meta.url)), "utf8");
    const bodyStart = submitSource.indexOf("await createPendingGeneration");
    const body = submitSource.slice(bodyStart);
    const consumeIndex = body.indexOf("await consumeForGeneration");
    const promoteIndex = body.indexOf("promoteGenerationToQueued");
    const enqueueIndex = body.indexOf("enqueueGenerationJob");

    assert.ok(consumeIndex >= 0);
    assert.ok(promoteIndex > consumeIndex);
    assert.ok(enqueueIndex > promoteIndex);
    assert.equal(submitSource.includes("apiKeyId: options.apiKeyId"), true);
  });

  it("does not charge credits in the worker processor", () => {
    const workerSource = readFileSync(fileURLToPath(new URL("./process-queued-generation.ts", import.meta.url)), "utf8");

    assert.equal(workerSource.includes("consumeForGeneration"), false);
    assert.equal(workerSource.includes("getUserBillingState"), true);
  });

  it("records generation credit consumption in usage_events with generationId", () => {
    const billingSource = readFileSync(fileURLToPath(new URL("../billing/subscription.ts", import.meta.url)), "utf8");

    assert.equal(billingSource.includes('event_type: "generation_credit_consumed"'), true);
    assert.equal(billingSource.includes("generationId: context.generationId"), true);
    assert.equal(billingSource.includes("apiKeyId: context.apiKeyId"), true);
  });

  it("refunds failed generations with generationId metadata", () => {
    const billingSource = readFileSync(fileURLToPath(new URL("../billing/subscription.ts", import.meta.url)), "utf8");

    assert.equal(billingSource.includes('event_type: "generation_credit_refunded"'), true);
    assert.equal(billingSource.includes("generationId"), true);
  });
});