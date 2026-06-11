import type { AssetRecord, GenerationRecord } from "@/types/project";

export const GENERATION_STATUSES = [
  "draft",
  "queued",
  "analyzing",
  "generating_copy",
  "rendering_assets",
  "completed",
  "failed"
] as const;

export type GenerationStatus = (typeof GENERATION_STATUSES)[number];

export type GenerationPhase = "queued" | "processing" | "completed" | "failed";

export const TERMINAL_GENERATION_STATUSES = ["completed", "failed"] as const satisfies readonly GenerationStatus[];

export const CLAIMABLE_GENERATION_STATUSES = ["queued"] as const satisfies readonly GenerationStatus[];

export const IN_PROGRESS_GENERATION_STATUSES = ["analyzing", "generating_copy", "rendering_assets"] as const satisfies readonly GenerationStatus[];

export type PublicGenerationAsset = {
  id: string;
  assetType: string;
  width: number;
  height: number;
  fileUrl: string;
  previewUrl: string | null;
};

export type PublicGenerationStatusResponse = {
  generationId: string;
  projectId: string;
  status: GenerationStatus;
  phase: GenerationPhase;
  assets: PublicGenerationAsset[];
  downloadUrl: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

export function isGenerationStatus(value: string): value is GenerationStatus {
  return (GENERATION_STATUSES as readonly string[]).includes(value);
}

export function isTerminalGenerationStatus(status: string): boolean {
  return (TERMINAL_GENERATION_STATUSES as readonly string[]).includes(status);
}

export function isClaimableGenerationStatus(status: string): boolean {
  return (CLAIMABLE_GENERATION_STATUSES as readonly string[]).includes(status);
}

export function isInProgressGenerationStatus(status: string): boolean {
  return (IN_PROGRESS_GENERATION_STATUSES as readonly string[]).includes(status);
}

export function getGenerationPhase(status: string): GenerationPhase {
  if (status === "queued" || status === "draft") return "queued";
  if (isTerminalGenerationStatus(status)) return status as "completed" | "failed";
  if (isInProgressGenerationStatus(status)) return "processing";
  return "queued";
}

function readDownloadUrl(styleJson: GenerationRecord["style_json"]): string | null {
  if (!styleJson || typeof styleJson !== "object") return null;
  const zipUrl = (styleJson as { zip_url?: unknown }).zip_url;
  return typeof zipUrl === "string" ? zipUrl : null;
}

export function mapAssetToPublic(asset: AssetRecord): PublicGenerationAsset {
  return {
    id: asset.id,
    assetType: asset.asset_type,
    width: asset.width,
    height: asset.height,
    fileUrl: asset.file_url,
    previewUrl: asset.preview_url
  };
}

export function mapGenerationToPublicStatus(generation: GenerationRecord, assets: AssetRecord[] = []): PublicGenerationStatusResponse {
  const status = isGenerationStatus(generation.status) ? generation.status : "queued";

  return {
    generationId: generation.id,
    projectId: generation.project_id,
    status,
    phase: getGenerationPhase(status),
    assets: assets.map(mapAssetToPublic),
    downloadUrl: status === "completed" ? readDownloadUrl(generation.style_json) : null,
    error: generation.error_message,
    createdAt: generation.created_at,
    updatedAt: generation.updated_at
  };
}