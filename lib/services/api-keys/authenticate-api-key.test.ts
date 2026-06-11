import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateApiKeyToken } from "./hash";
import {
  readCustomerApiKeyFromRequest,
  requireAuthenticatedApiCustomer
} from "./authenticate-api-key";

describe("authenticateApiKey request parsing", () => {
  it("returns null when API key header is missing", () => {
    const request = new Request("http://localhost/api/v1/projects");
    assert.equal(readCustomerApiKeyFromRequest(request), null);
    const missing = requireAuthenticatedApiCustomer(null);
    assert.equal("response" in missing && missing.response.status, 401);
  });

  it("reads bearer customer API keys", () => {
    const token = generateApiKeyToken("live");
    const request = new Request("http://localhost/api/v1/projects", {
      headers: { authorization: `Bearer ${token}` }
    });

    assert.equal(readCustomerApiKeyFromRequest(request), token);
  });

  it("reads x-launchpix-api-key customer API keys", () => {
    const token = generateApiKeyToken("test");
    const request = new Request("http://localhost/api/v1/projects", {
      headers: { "x-launchpix-api-key": token }
    });

    assert.equal(readCustomerApiKeyFromRequest(request), token);
  });
});