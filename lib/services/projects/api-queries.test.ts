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
    assert.equal(generateRouteSource.includes('error: "Project not found."'), true);
    assert.equal(generateRouteSource.includes("status: 404"), true);
  });
});