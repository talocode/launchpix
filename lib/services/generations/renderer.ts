import { generateMistralAssetPng } from "@/lib/ai/mistral-image";
import type { GenerationPlan } from "@/lib/ai/schemas/asset-plan";
import { buildDeterministicAssets, renderAssetPng } from "@/lib/render/pipeline";
import { runAssetQualityChecks, type QualityIssue } from "@/lib/render/quality";
import type { ProjectRecord, UploadRecord } from "@/types/project";

const MISTRAL_ASSET_TIMEOUT_MS = 45_000;
const MISTRAL_RENDER_ATTEMPTS = 2;

export type QualityFailureDetail = QualityIssue & {
  asset_type: string;
};

export type DeterministicAsset = ReturnType<typeof buildDeterministicAssets>[number];

export type RenderedAsset = {
  index: number;
  asset: DeterministicAsset;
  fullPng: Buffer | Uint8Array;
  previewPng: Buffer | Uint8Array;
  renderSource: "mistral_image_generation" | "deterministic_template";
  qualityReport: ReturnType<typeof runAssetQualityChecks>;
  assetStartedAt: number;
  filename: string;
};

export type RenderAssetsResult = {
  deterministicAssets: DeterministicAsset[];
  renderedAssets: RenderedAsset[];
  renderSources: Record<string, number>;
  qualityFailures: Array<{ assetType: string; issues: string[] }>;
  qualityWarnings: QualityFailureDetail[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function generateMistralAssetWithRetry(input: Parameters<typeof generateMistralAssetPng>[0]) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MISTRAL_RENDER_ATTEMPTS; attempt += 1) {
    try {
      return await withTimeout(generateMistralAssetPng(input), MISTRAL_ASSET_TIMEOUT_MS, "Mistral image generation");
    } catch (error) {
      lastError = error;
      if (attempt < MISTRAL_RENDER_ATTEMPTS) await sleep(850 * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Mistral image generation failed.");
}

export async function renderAssets(
  project: ProjectRecord,
  safePlan: GenerationPlan,
  uploads: UploadRecord[]
): Promise<RenderAssetsResult> {
  const deterministicAssets = buildDeterministicAssets(safePlan, uploads);
  const renderSources: Record<string, number> = {};
  const qualityFailures: Array<{ assetType: string; issues: string[] }> = [];
  const qualityWarnings: QualityFailureDetail[] = [];
  const renderedAssets: RenderedAsset[] = [];

  for (const [index, asset] of deterministicAssets.entries()) {
    let renderSource: "mistral_image_generation" | "deterministic_template" = "mistral_image_generation";
    let fullPng: Buffer | Uint8Array;
    const assetStartedAt = Date.now();
    const qualityReport = runAssetQualityChecks({
      assetType: asset.asset_type,
      templateFamily: asset.template_family,
      headline: asset.headline,
      subheadline: asset.subheadline,
      callouts: asset.callouts,
      cta: safePlan.cta_line,
      screenshotUrls: asset.screenshotUrls,
      primaryColor: project.primary_color
    });

    if (!qualityReport.pass) {
      qualityFailures.push({
        assetType: asset.asset_type,
        issues: qualityReport.issues.filter((issue) => issue.severity === "error").map((issue) => issue.message)
      });
      continue;
    }

    for (const issue of qualityReport.issues.filter((item) => item.severity === "warning")) {
      qualityWarnings.push({
        asset_type: asset.asset_type,
        code: issue.code,
        message: issue.message,
        severity: issue.severity
      });
    }

    try {
      fullPng = await generateMistralAssetWithRetry({
        plan: safePlan,
        asset,
        project: {
          name: project.name,
          product_type: project.product_type,
          platform: project.platform,
          description: project.description,
          audience: project.audience,
          primary_color: project.primary_color
        }
      });
    } catch (error) {
      renderSource = "deterministic_template";
      console.error("Mistral image generation failed; using deterministic renderer:", error instanceof Error ? error.message : error);
      fullPng = await renderAssetPng({
        width: asset.width,
        height: asset.height,
        templateFamily: asset.template_family,
        headline: asset.headline,
        subheadline: asset.subheadline,
        callouts: asset.callouts,
        cta: safePlan.cta_line,
        screenshotUrls: asset.screenshotUrls,
        primaryColor: project.primary_color
      });
    }

    renderSources[renderSource] = (renderSources[renderSource] || 0) + 1;

    const previewPng = fullPng;
    const filename = `${String(index + 1).padStart(2, "0")}-${asset.asset_type}.png`;

    renderedAssets.push({
      index,
      asset,
      fullPng,
      previewPng,
      renderSource,
      qualityReport,
      assetStartedAt,
      filename
    });
  }

  return {
    deterministicAssets,
    renderedAssets,
    renderSources,
    qualityFailures,
    qualityWarnings
  };
}