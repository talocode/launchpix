import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateApiKeyToken, getApiKeyLookupPrefix, hashApiKey, isCustomerApiKeyFormat, verifyApiKeyHash } from "./hash";

describe("customer API key hash helpers", () => {
  it("generates lp_live and lp_test key formats", () => {
    const live = generateApiKeyToken("live");
    const test = generateApiKeyToken("test");

    assert.match(live, /^lp_live_/);
    assert.match(test, /^lp_test_/);
    assert.equal(isCustomerApiKeyFormat(live), true);
    assert.equal(isCustomerApiKeyFormat("platform-shared-key"), false);
  });

  it("verifies hashed customer API keys", () => {
    const token = generateApiKeyToken("test");
    const storedHash = hashApiKey(token);

    assert.equal(getApiKeyLookupPrefix(token), token.slice(0, 16));
    assert.equal(verifyApiKeyHash(token, storedHash), true);
    assert.equal(verifyApiKeyHash(`${token}x`, storedHash), false);
  });
});