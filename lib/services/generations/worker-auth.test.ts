import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  getConfiguredWorkerSecret,
  hasValidLaunchPixWorkerSecret,
  readWorkerSecretFromRequest,
  requireLaunchPixWorkerSecret
} from "./worker-auth";

const originalSecret = process.env.LAUNCHPIX_WORKER_SECRET;

afterEach(() => {
  if (originalSecret === undefined) delete process.env.LAUNCHPIX_WORKER_SECRET;
  else process.env.LAUNCHPIX_WORKER_SECRET = originalSecret;
});

describe("worker auth", () => {
  it("rejects requests when worker secret is not configured", async () => {
    delete process.env.LAUNCHPIX_WORKER_SECRET;

    const response = requireLaunchPixWorkerSecret(new Request("http://localhost/process"));
    assert.ok(response);
    assert.equal(response.status, 503);
  });

  it("rejects missing worker secret with 401", async () => {
    process.env.LAUNCHPIX_WORKER_SECRET = "test-secret";

    const response = requireLaunchPixWorkerSecret(new Request("http://localhost/process"));
    assert.ok(response);
    assert.equal(response.status, 401);
  });

  it("rejects invalid worker secret with 401", async () => {
    process.env.LAUNCHPIX_WORKER_SECRET = "test-secret";

    const response = requireLaunchPixWorkerSecret(
      new Request("http://localhost/process", {
        headers: { "x-launchpix-worker-secret": "wrong-secret" }
      })
    );
    assert.ok(response);
    assert.equal(response.status, 401);
  });

  it("accepts valid worker secret header", () => {
    process.env.LAUNCHPIX_WORKER_SECRET = "test-secret";

    const request = new Request("http://localhost/process", {
      headers: { "x-launchpix-worker-secret": "test-secret" }
    });

    assert.equal(readWorkerSecretFromRequest(request), "test-secret");
    assert.equal(hasValidLaunchPixWorkerSecret(request), true);
    assert.equal(requireLaunchPixWorkerSecret(request), null);
  });

  it("accepts valid bearer worker secret", () => {
    process.env.LAUNCHPIX_WORKER_SECRET = "test-secret";

    const request = new Request("http://localhost/process", {
      headers: { authorization: "Bearer test-secret" }
    });

    assert.equal(hasValidLaunchPixWorkerSecret(request), true);
    assert.equal(requireLaunchPixWorkerSecret(request), null);
  });

  it("ignores blank configured worker secret", () => {
    process.env.LAUNCHPIX_WORKER_SECRET = "   ";
    assert.equal(getConfiguredWorkerSecret(), null);
  });
});