import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { enqueueGenerationJob } from "./enqueue";

function createSupabaseMock(options: {
  generation?: { id: string; status: string; project_id: string } | null;
  loadError?: string | null;
  enqueueError?: string | null;
}) {
  return {
    from(table: string) {
      if (table === "generations") {
        return {
          select() {
            return {
              eq() {
                return {
                  eq() {
                    return {
                      async maybeSingle() {
                        if (options.loadError) return { data: null, error: { message: options.loadError } };
                        return { data: options.generation ?? null, error: null };
                      }
                    };
                  }
                };
              }
            };
          }
        };
      }

      if (table === "usage_events") {
        return {
          async insert() {
            return { error: options.enqueueError ? { message: options.enqueueError } : null };
          }
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }
  };
}

describe("enqueueGenerationJob", () => {
  it("records a durable enqueue event for a queued generation", async () => {
    const result = await enqueueGenerationJob({
      supabase: createSupabaseMock({
        generation: { id: "gen-1", status: "queued", project_id: "proj-1" }
      }) as never,
      generationId: "gen-1",
      projectId: "proj-1",
      userId: "user-1",
      attempt: 1
    });

    assert.equal(result.generationId, "gen-1");
    assert.equal(result.status, "queued");
    assert.equal(result.attempt, 1);
    assert.ok(result.enqueuedAt);
  });

  it("rejects enqueue when generation is not queued", async () => {
    await assert.rejects(
      () =>
        enqueueGenerationJob({
          supabase: createSupabaseMock({
            generation: { id: "gen-1", status: "completed", project_id: "proj-1" }
          }) as never,
          generationId: "gen-1",
          projectId: "proj-1",
          userId: "user-1"
        }),
      /not enqueueable/
    );
  });

  it("surfaces enqueue persistence failures", async () => {
    await assert.rejects(
      () =>
        enqueueGenerationJob({
          supabase: createSupabaseMock({
            generation: { id: "gen-1", status: "queued", project_id: "proj-1" },
            enqueueError: "write failed"
          }) as never,
          generationId: "gen-1",
          projectId: "proj-1",
          userId: "user-1"
        }),
      /write failed/
    );
  });
});