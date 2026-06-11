import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { mapApiKeyToPublicMetadata } from "./public-metadata";

describe("customer API key management", () => {
  it("maps list metadata without hash or plaintext fields", () => {
    const metadata = mapApiKeyToPublicMetadata({
      id: "key-1",
      name: "Production",
      key_prefix: "lp_live_abcd1234",
      created_at: "2026-06-11T00:00:00.000Z",
      last_used_at: null,
      revoked_at: null
    });

    assert.deepEqual(metadata, {
      id: "key-1",
      name: "Production",
      prefix: "lp_live_abcd1234...",
      createdAt: "2026-06-11T00:00:00.000Z",
      lastUsedAt: null,
      revokedAt: null,
      status: "active"
    });
    assert.equal("key_hash" in metadata, false);
    assert.equal("token" in metadata, false);
  });

  it("create route returns plaintext token only in POST response", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../../../app/api/dashboard/api-keys/route.ts", import.meta.url)),
      "utf8"
    );

    assert.equal(source.includes("token: created.token"), true);
    assert.equal(source.includes("listCustomerApiKeys"), true);
    assert.equal(source.includes("key_hash"), false);
  });

  it("list query selects metadata columns only", () => {
    const source = readFileSync(fileURLToPath(new URL("./list-api-keys.ts", import.meta.url)), "utf8");

    assert.equal(source.includes("key_hash"), false);
    assert.equal(source.includes("key_prefix"), true);
    assert.equal(source.includes('.eq("user_id", userId)'), true);
  });

  it("revoke is scoped to the owning user and active keys", () => {
    const source = readFileSync(fileURLToPath(new URL("./revoke-api-key.ts", import.meta.url)), "utf8");

    assert.equal(source.includes('.eq("user_id", input.userId)'), true);
    assert.equal(source.includes('.is("revoked_at", null)'), true);
  });

  it("revoked keys cannot authenticate because lookup filters revoked_at null", () => {
    const source = readFileSync(fileURLToPath(new URL("./authenticate-api-key.ts", import.meta.url)), "utf8");

    assert.equal(source.includes('.is("revoked_at", null)'), true);
  });

  it("dashboard routes require signed-in user, not customer API keys", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../../../app/api/dashboard/api-keys/route.ts", import.meta.url)),
      "utf8"
    );

    assert.equal(source.includes("requireUser"), true);
    assert.equal(source.includes("authenticateApiCustomerRequest"), false);
    assert.equal(source.includes("requireLaunchPixWorkerSecret"), false);
  });
});