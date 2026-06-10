import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GenerationRecord } from "@/types/project";
import { claimGenerationForProcessing } from "./claim";

type MockGeneration = GenerationRecord & { updated_at?: string };

function createClaimableGeneration(overrides: Partial<MockGeneration> = {}): MockGeneration {
  return {
    id: "gen-1",
    project_id: "proj-1",
    status: "queued",
    ai_summary: null,
    copy_json: null,
    style_json: null,
    error_message: null,
    created_at: "2026-06-10T12:00:00.000Z",
    updated_at: "2026-06-10T12:00:00.000Z",
    ...overrides
  };
}

function createMockSupabase(generation: MockGeneration | null, claimResult: MockGeneration | null) {
  return {
    from(table: string) {
      if (table !== "generations") throw new Error(`Unexpected table: ${table}`);

      return {
        update() {
          return {
            eq() {
              return {
                eq() {
                  return {
                    select() {
                      return {
                        async maybeSingle() {
                          return { data: claimResult, error: null };
                        }
                      };
                    }
                  };
                }
              };
            }
          };
        },
        select() {
          return {
            eq() {
              return {
                async maybeSingle() {
                  return { data: generation, error: null };
                }
              };
            }
          };
        }
      };
    }
  };
}

describe("claimGenerationForProcessing", () => {
  it("claims a queued generation exactly once", async () => {
    const queued = createClaimableGeneration();
    const claimed = createClaimableGeneration({ status: "analyzing" });

    const result = await claimGenerationForProcessing({
      supabase: createMockSupabase(queued, claimed) as never,
      generationId: "gen-1",
      workerId: "worker-a"
    });

    assert.equal(result.claimed, true);
    if (result.claimed) assert.equal(result.generation.status, "analyzing");
  });

  it("rejects completed generations", async () => {
    const completed = createClaimableGeneration({ status: "completed" });

    const result = await claimGenerationForProcessing({
      supabase: createMockSupabase(completed, null) as never,
      generationId: "gen-1"
    });

    assert.deepEqual(result, { claimed: false, reason: "terminal" });
  });

  it("rejects failed generations", async () => {
    const failed = createClaimableGeneration({ status: "failed", error_message: "boom" });

    const result = await claimGenerationForProcessing({
      supabase: createMockSupabase(failed, null) as never,
      generationId: "gen-1"
    });

    assert.deepEqual(result, { claimed: false, reason: "terminal" });
  });

  it("rejects generations already in progress", async () => {
    const analyzing = createClaimableGeneration({ status: "analyzing" });

    const result = await claimGenerationForProcessing({
      supabase: createMockSupabase(analyzing, null) as never,
      generationId: "gen-1"
    });

    assert.deepEqual(result, { claimed: false, reason: "in_progress" });
  });

  it("returns not_found when generation does not exist", async () => {
    const result = await claimGenerationForProcessing({
      supabase: createMockSupabase(null, null) as never,
      generationId: "missing"
    });

    assert.deepEqual(result, { claimed: false, reason: "not_found" });
  });
});