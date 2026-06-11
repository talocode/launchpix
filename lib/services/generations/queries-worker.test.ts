import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { listQueuedGenerations } from "./queries";

describe("listQueuedGenerations", () => {
  it("respects the worker batch limit", async () => {
    const calls: number[] = [];

    const supabase = {
      from(table: string) {
        assert.equal(table, "generations");
        return {
          select() {
            return {
              eq() {
                return {
                  order() {
                    return {
                      limit(limit: number) {
                        calls.push(limit);
                        return Promise.resolve({
                          data: [
                            { id: "gen-1", project_id: "proj-1" },
                            { id: "gen-2", project_id: "proj-2" }
                          ],
                          error: null
                        });
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

    const targets = await listQueuedGenerations(supabase as never, 2);

    assert.deepEqual(calls, [2]);
    assert.deepEqual(targets, [
      { generationId: "gen-1", projectId: "proj-1" },
      { generationId: "gen-2", projectId: "proj-2" }
    ]);
  });
});