import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("generation query scoping", () => {
  it("returns null when generationId does not belong to the requested project", async () => {
    const rows = [{ id: "gen-1", project_id: "proj-1", status: "queued" }];

    function lookupGeneration(projectId: string, generationId: string) {
      const filters: Record<string, string> = {};
      const query = {
        eq(column: string, value: string) {
          filters[column] = value;
          return query;
        },
        async maybeSingle() {
          const match = rows.find((row) => row.id === filters.id && row.project_id === filters.project_id);
          return { data: match ?? null, error: null };
        }
      };

      return query.eq("id", generationId).eq("project_id", projectId).maybeSingle();
    }

    const matching = await lookupGeneration("proj-1", "gen-1");
    const mismatched = await lookupGeneration("other-project", "gen-1");

    assert.equal(matching.data?.id, "gen-1");
    assert.equal(mismatched.data, null);
  });
});