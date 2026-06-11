import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AssetRecord, GenerationRecord } from "@/types/project";
import {
  getGenerationPhase,
  isClaimableGenerationStatus,
  isTerminalGenerationStatus,
  mapGenerationToPublicStatus
} from "./status";

const baseGeneration: GenerationRecord = {
  id: "gen-1",
  project_id: "proj-1",
  status: "completed",
  ai_summary: { secret: "internal" },
  copy_json: { secret: "internal" },
  style_json: { zip_url: "https://example.com/pack.zip", secret: "internal" },
  error_message: null,
  created_at: "2026-06-10T12:00:00.000Z",
  updated_at: "2026-06-10T12:05:00.000Z"
};

const sampleAsset: AssetRecord = {
  id: "asset-1",
  generation_id: "gen-1",
  asset_type: "hero_banner",
  width: 1200,
  height: 630,
  file_url: "https://example.com/full.png",
  preview_url: "https://example.com/preview.png",
  metadata_json: { render_source: "mistral_image_generation" },
  created_at: "2026-06-10T12:04:00.000Z"
};

describe("generation status helpers", () => {
  it("marks completed and failed as terminal", () => {
    assert.equal(isTerminalGenerationStatus("completed"), true);
    assert.equal(isTerminalGenerationStatus("failed"), true);
    assert.equal(isTerminalGenerationStatus("queued"), false);
  });

  it("allows only queued generations to be claimable", () => {
    assert.equal(isClaimableGenerationStatus("queued"), true);
    assert.equal(isClaimableGenerationStatus("analyzing"), false);
    assert.equal(isClaimableGenerationStatus("completed"), false);
  });

  it("maps in-progress statuses to processing phase", () => {
    assert.equal(getGenerationPhase("rendering_assets"), "processing");
    assert.equal(getGenerationPhase("queued"), "queued");
    assert.equal(getGenerationPhase("failed"), "failed");
  });
});

describe("mapGenerationToPublicStatus", () => {
  it("returns polling payload without private generation fields", () => {
    const response = mapGenerationToPublicStatus(baseGeneration, [sampleAsset]);

    assert.equal(response.generationId, "gen-1");
    assert.equal(response.projectId, "proj-1");
    assert.equal(response.status, "completed");
    assert.equal(response.phase, "completed");
    assert.equal(response.downloadUrl, "https://example.com/pack.zip");
    assert.equal(response.error, null);
    assert.deepEqual(response.assets, [
      {
        id: "asset-1",
        assetType: "hero_banner",
        width: 1200,
        height: 630,
        fileUrl: "https://example.com/full.png",
        previewUrl: "https://example.com/preview.png"
      }
    ]);
    assert.equal("ai_summary" in response, false);
    assert.equal("copy_json" in response, false);
    assert.equal("style_json" in response, false);
    assert.equal("metadata_json" in response.assets[0], false);
  });

  it("omits downloadUrl until generation is completed", () => {
    const response = mapGenerationToPublicStatus({
      ...baseGeneration,
      status: "rendering_assets",
      style_json: { zip_url: "https://example.com/pack.zip" }
    });

    assert.equal(response.phase, "processing");
    assert.equal(response.downloadUrl, null);
  });
});