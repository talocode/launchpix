import { Mistral } from "@mistralai/mistralai";
import { generationPlanSchema, type GenerationPlan } from "@/lib/ai/schemas/asset-plan";
import { buildGenerationPrompt } from "@/lib/ai/prompts/generation";
import { logGenerationError, logGenerationEvent } from "@/lib/services/generations/logging";

const visionModel = process.env.MISTRAL_MODEL_VISION || "mistral-small-2506";
const textModel = process.env.MISTRAL_MODEL_TEXT || "mistral-small-2506";

function compactText(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function createDeterministicGenerationPlan(input: {
  project: {
    name: string;
    product_type: string;
    platform: string;
    description: string;
    audience: string;
    style_preset: string;
    style_prompt: string | null;
  };
  uploads: Array<{ id: string; file_url: string; position: number }>;
}): GenerationPlan {
  const orderedUploads = [...input.uploads].sort((a, b) => a.position - b.position);
  const firstUploadId = orderedUploads[0]?.id;

  if (!firstUploadId) {
    throw new Error("At least one screenshot is required.");
  }

  const templateFamily = generationPlanSchema.shape.recommended_template_family.safeParse(input.project.style_preset).success
    ? (input.project.style_preset as "minimal" | "bold" | "dark" | "gradient")
    : "minimal";

  const selectedHeadline = compactText(`${input.project.name} is ready to launch`, 80);
  const subheadline = compactText(input.project.description || `Built for ${input.project.audience}`, 120);
  const callouts = [
    compactText(`Built for ${input.project.audience}`, 48),
    compactText(`Optimized for ${input.project.platform.replaceAll("_", " ")}`, 48),
    "Clear product story"
  ];

  const dimensions = [
    { asset_type: "listing_01", width: 1280, height: 800 },
    { asset_type: "listing_02", width: 1280, height: 800 },
    { asset_type: "listing_03", width: 1280, height: 800 },
    { asset_type: "listing_04", width: 1280, height: 800 },
    { asset_type: "listing_05", width: 1280, height: 800 },
    { asset_type: "promo_tile", width: 440, height: 280 },
    { asset_type: "hero_banner", width: 1400, height: 560 }
  ];

  return generationPlanSchema.parse({
    product_summary: compactText(input.project.description, 280),
    value_proposition: compactText(`${input.project.name} helps ${input.project.audience} move faster.`, 220),
    target_audience_summary: compactText(input.project.audience, 180),
    headline_options: [
      selectedHeadline,
      compactText(`Launch ${input.project.name} with clarity`, 80),
      compactText(`Show ${input.project.name} at its best`, 80)
    ],
    selected_headline: selectedHeadline,
    subheadline,
    feature_callouts: callouts,
    cta_line: "Start now",
    color_guidance: {
      background_style: "clean gradient",
      accent_usage: "use brand color for emphasis",
      contrast_mode: "high contrast"
    },
    recommended_template_family: templateFamily,
    screenshot_emphasis: orderedUploads.slice(0, 5).map((upload, index) => ({
      upload_id: upload.id,
      priority: Math.min(5, index + 1),
      reason: "Use this screenshot to show product value."
    })),
    assets: dimensions.map((dimension, index) => ({
      ...dimension,
      headline: index === 5 ? compactText(input.project.name, 80) : selectedHeadline,
      subheadline,
      callouts: callouts.slice(0, 3),
      screenshot_ids: [orderedUploads[index % orderedUploads.length]?.id || firstUploadId],
      template_family: templateFamily,
      notes: "Fallback deterministic plan generated when AI planning was unavailable."
    }))
  });
}

function parseJsonObject(text: string) {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Mistral did not return a JSON object.");
    }
    return JSON.parse(withoutFence.slice(start, end + 1));
  }
}

function normalizeMistralPlanPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return payload;
  const record = payload as Record<string, unknown>;
  return record.plan || record.generation_plan || record.asset_plan || record.data || payload;
}

export async function mistralGenerateAssetPlan(input: {
  project: {
    name: string;
    product_type: string;
    platform: string;
    description: string;
    audience: string;
    style_preset: string;
    style_prompt: string | null;
  };
  uploads: Array<{ id: string; file_url: string; position: number }>;
}): Promise<GenerationPlan> {
  if (!process.env.MISTRAL_API_KEY) {
    logGenerationEvent("warn", "mistral_plan_fallback", {
      reason: "missing_api_key",
      project: input.project.name,
      platform: input.project.platform,
      uploadCount: input.uploads.length
    });
    return createDeterministicGenerationPlan(input);
  }

  const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  const prompt = buildGenerationPrompt({
    name: input.project.name,
    productType: input.project.product_type,
    platform: input.project.platform,
    description: input.project.description,
    audience: input.project.audience,
    stylePreset: input.project.style_preset,
    stylePrompt: input.project.style_prompt,
    uploads: input.uploads
  });

  try {
    logGenerationEvent("info", "mistral_plan_request_started", {
      model: textModel,
      project: input.project.name,
      platform: input.project.platform,
      uploadCount: input.uploads.length
    });

    const response = await client.chat.complete({
      model: textModel,
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Return strict JSON only. It must match the requested LaunchPix generation plan schema exactly."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const raw = response.choices?.[0]?.message?.content;
    const text = Array.isArray(raw) ? raw.map((item: any) => (item.type === "text" ? item.text : "")).join(" ") : String(raw || "{}");
    logGenerationEvent("info", "mistral_plan_request_completed", {
      model: textModel,
      project: input.project.name,
      uploadCount: input.uploads.length
    });
    return generationPlanSchema.parse(normalizeMistralPlanPayload(parseJsonObject(text)));
  } catch (error) {
    logGenerationError("mistral_plan_failed_fallback", error, {
      model: textModel,
      project: input.project.name,
      platform: input.project.platform,
      uploadCount: input.uploads.length
    });
    return createDeterministicGenerationPlan(input);
  }
}

export const mistralModels = { visionModel, textModel };
