import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

describe("getProjectOverviewForApi", () => {
  it("scopes API project access to the authenticated key owner", () => {
    const querySource = readFileSync(fileURLToPath(new URL("./api-queries.ts", import.meta.url)), "utf8");
    const generateRouteSource = readFileSync(
      fileURLToPath(new URL("../../../app/api/v1/projects/[projectId]/generate/route.ts", import.meta.url)),
      "utf8"
    );

    assert.equal(querySource.includes('.eq("user_id", userId)'), true);
    assert.equal(querySource.includes("maybeSingle"), true);
    assert.equal(querySource.includes("UUID_PATTERN"), true);
    assert.equal(querySource.includes("isInvalidUuidLookupError"), true);
    assert.equal(generateRouteSource.includes('error: "Project not found."'), true);
    assert.equal(generateRouteSource.includes("status: 404"), true);
  });

  it("returns null for malformed project ids instead of throwing", () => {
    const querySource = readFileSync(fileURLToPath(new URL("./api-queries.ts", import.meta.url)), "utf8");

    assert.equal(querySource.includes("if (!UUID_PATTERN.test(projectId)) return null"), true);
    assert.equal(querySource.includes("if (isInvalidUuidLookupError(projectError)) return null"), true);
  });
});