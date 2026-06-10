import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { promoteGenerationToQueued } from "./create-generation";

describe("promoteGenerationToQueued", () => {
  it("only promotes draft generations to queued", async () => {
    const updates: Array<{ status: string; filters: Record<string, string> }> = [];

    const supabase = {
      from(table: string) {
        assert.equal(table, "generations");
        return {
          update(payload: { status: string }) {
            return {
              eq(column: string, value: string) {
                const filters: Record<string, string> = { [column]: value };
                return {
                  eq(column2: string, value2: string) {
                    filters[column2] = value2;
                    updates.push({ status: payload.status, filters });
                    return {
                      select() {
                        return {
                          async single() {
                            const isDraftPromotion =
                              payload.status === "queued" && filters.status === "draft" && filters.id === "gen-1";
                            return {
                              data: isDraftPromotion ? { id: "gen-1", status: "queued", project_id: "proj-1" } : null,
                              error: isDraftPromotion ? null : { message: "No rows updated" }
                            };
                          }
                        };
                      }
                    };
                  }
                };
              }
            };
          }
        };
      }
    };

    const generation = await promoteGenerationToQueued(supabase as never, "gen-1");
    assert.equal(generation.status, "queued");
    assert.deepEqual(updates[0]?.filters, { id: "gen-1", status: "draft" });
  });
});