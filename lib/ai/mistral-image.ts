import { Mistral } from "@mistralai/mistralai";
import type { GenerationPlan } from "@/lib/ai/schemas/asset-plan";

const imageModel = process.env.MISTRAL_IMAGE_MODEL || "mistral-medium-latest";
const MIN_IMAGE_BYTES = 24_000;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

let cachedImageAgentId: string | null = null;

function redactError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replaceAll(process.env.MISTRAL_API_KEY || "", "[redacted]");
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}

function assertUsablePng(buffer: Buffer) {
  if (buffer.length < MIN_IMAGE_BYTES) {
    throw new Error(`Mistral image output was too small to be a usable asset (${buffer.length} bytes).`);
  }

  if (!buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error("Mistral image output was not a PNG file.");
  }

  return buffer;
}

async function getImageAgentId(client: Mistral) {
  if (process.env.MISTRAL_IMAGE_AGENT_ID) return process.env.MISTRAL_IMAGE_AGENT_ID;
  if (cachedImageAgentId) return cachedImageAgentId;

  const agent = await client.beta.agents.create({
    model: imageModel,
    name: "LaunchPix Image Generation Agent",
    description: "Generates final LaunchPix product marketing assets.",
    instructions:
      "Use the image_generation tool whenever the user requests a LaunchPix asset. Generate polished product marketing visuals with clear hierarchy, strong composition, and no placeholder UI.",
    tools: [{ type: "image_generation" }],
    completionArgs: {
      temperature: 0.35,
      topP: 0.95
    }
  });

  cachedImageAgentId = agent.id;
  return agent.id;
}

function findGeneratedFileId(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findGeneratedFileId(item);
      if (found) return found;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  if (record.type === "tool_file" && typeof record.fileId === "string") return record.fileId;
  if (record.type === "tool_file" && typeof record.file_id === "string") return record.file_id;

  for (const nested of Object.values(record)) {
    const found = findGeneratedFileId(nested);
    if (found) return found;
  }

  return null;
}

function buildImagePrompt(input: {
  plan: GenerationPlan;
  asset: GenerationPlan["assets"][number] & { screenshotUrls: string[] };
  project: {
    name: string;
    product_type: string;
    platform: string;
    description: string;
    audience: string;
    primary_color: string | null;
  };
}) {
  const { asset, plan, project } = input;
  const screenshotReferences = asset.screenshotUrls.length
    ? `Use these uploaded product screenshots as the source-product reference if accessible: ${asset.screenshotUrls.join(", ")}.`
    : "No screenshot reference URLs are available, so create a credible product UI presentation based on the brief.";

  return [
    `Generate one finished LaunchPix marketing asset as a PNG image.`,
    `Canvas: ${asset.width}x${asset.height}px.`,
    `Asset type: ${asset.asset_type.replaceAll("_", " ")}.`,
    `Product: ${project.name}.`,
    `Product type: ${project.product_type.replaceAll("_", " ")}.`,
    `Target platform: ${project.platform.replaceAll("_", " ")}.`,
    `Audience: ${project.audience}.`,
    `Product description: ${project.description}.`,
    `Primary brand color: ${project.primary_color || "choose a polished modern accent color"}.`,
    `Headline to place in the design: "${asset.headline || plan.selected_headline}".`,
    `Subheadline to place in the design: "${asset.subheadline || plan.subheadline}".`,
    `Callouts: ${asset.callouts.join("; ")}.`,
    `CTA: ${plan.cta_line}.`,
    screenshotReferences,
    `Design requirements: premium SaaS/product-launch visual, clean composition, real-looking app or web UI frame, sharp readable typography, strong spacing, no generic AI artifacts, no misspelled text, no fake watermarks, no extra logos unless they fit LaunchPix/product context.`,
    `Return the image file only.`
  ].join("\n");
}

export async function generateMistralAssetPng(input: {
  plan: GenerationPlan;
  asset: GenerationPlan["assets"][number] & { screenshotUrls: string[] };
  project: {
    name: string;
    product_type: string;
    platform: string;
    description: string;
    audience: string;
    primary_color: string | null;
  };
}) {
  if (!process.env.MISTRAL_API_KEY) throw new Error("MISTRAL_API_KEY is not configured.");

  const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  const agentId = await getImageAgentId(client);
  const response = await client.beta.conversations.start({
    agentId,
    inputs: buildImagePrompt(input),
    store: false
  });

  const fileId = findGeneratedFileId(response.outputs);
  if (!fileId) throw new Error("Mistral image generation did not return an image file.");

  try {
    const stream = await client.files.download({ fileId });
    return assertUsablePng(await streamToBuffer(stream));
  } catch (error) {
    throw new Error(`Could not download Mistral generated image: ${redactError(error)}`);
  }
}

export const mistralImageModels = { imageModel };
