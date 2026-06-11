import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { generateApiKeyToken } from "./hash";
import { hasValidLaunchPixWorkerSecret } from "@/lib/services/generations/worker-auth";

const originalWorkerSecret = process.env.LAUNCHPIX_WORKER_SECRET;

afterEach(() => {
  if (originalWorkerSecret === undefined) delete process.env.LAUNCHPIX_WORKER_SECRET;
  else process.env.LAUNCHPIX_WORKER_SECRET = originalWorkerSecret;
});

describe("public API key vs worker secret separation", () => {
  it("rejects customer API keys on the internal worker route", () => {
    process.env.LAUNCHPIX_WORKER_SECRET = "worker-secret-only";

    const customerKey = generateApiKeyToken("live");
    const request = new Request("http://localhost/api/internal/worker/generations/process", {
      headers: {
        "x-launchpix-api-key": customerKey,
        authorization: `Bearer ${customerKey}`
      }
    });

    assert.equal(hasValidLaunchPixWorkerSecret(request), false);
  });

  it("accepts only LAUNCHPIX_WORKER_SECRET on worker requests", () => {
    process.env.LAUNCHPIX_WORKER_SECRET = "worker-secret-only";

    const validRequest = new Request("http://localhost/api/internal/worker/generations/process", {
      headers: { "x-launchpix-worker-secret": "worker-secret-only" }
    });
    const invalidRequest = new Request("http://localhost/api/internal/worker/generations/process", {
      headers: { "x-launchpix-worker-secret": "wrong-secret" }
    });

    assert.equal(hasValidLaunchPixWorkerSecret(validRequest), true);
    assert.equal(hasValidLaunchPixWorkerSecret(invalidRequest), false);
  });
});