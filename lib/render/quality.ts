import { getTemplatePalette, type TemplateFamily } from "@/lib/render/templates/registry";

export type QualitySeverity = "error" | "warning";

export interface QualityIssue {
  code: string;
  severity: QualitySeverity;
  message: string;
}

export interface QualityReport {
  pass: boolean;
  issues: QualityIssue[];
}

interface AssetQualityInput {
  assetType: string;
  templateFamily: TemplateFamily;
  headline: string;
  subheadline: string;
  callouts: string[];
  cta: string;
  screenshotUrls: string[];
  primaryColor?: string | null;
}

function normalizeHexColor(value: string) {
  const hex = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(hex)) return hex;
  if (/^#[0-9a-f]{3}$/.test(hex)) {
    const r = hex[1];
    const g = hex[2];
    const b = hex[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return null;
}

function relativeLuminance(hex: string) {
  const safeHex = normalizeHexColor(hex);
  if (!safeHex) return null;

  const channels = [safeHex.slice(1, 3), safeHex.slice(3, 5), safeHex.slice(5, 7)].map((part) => Number.parseInt(part, 16) / 255);
  const mapped = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * mapped[0] + 0.7152 * mapped[1] + 0.0722 * mapped[2];
}

function contrastRatio(foreground: string, background: string) {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  if (l1 === null || l2 === null) return null;
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function compactText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function runAssetQualityChecks(input: AssetQualityInput): QualityReport {
  const issues: QualityIssue[] = [];
  const palette = getTemplatePalette(input.templateFamily, input.primaryColor);

  const headline = compactText(input.headline);
  const subheadline = compactText(input.subheadline);
  const cta = compactText(input.cta);
  const callouts = input.callouts.map(compactText).filter(Boolean);

  if (!headline) issues.push({ code: "headline_missing", severity: "error", message: "Headline is missing. Add a clear value statement." });
  if (headline.length > 65) issues.push({ code: "headline_overflow", severity: "error", message: `Headline is too long (${headline.length}/65). Shorten it to avoid text clipping.` });

  if (!subheadline) issues.push({ code: "subheadline_missing", severity: "error", message: "Subheadline is missing. Add supporting context for the headline." });
  if (subheadline.length > 95) issues.push({ code: "subheadline_overflow", severity: "error", message: `Subheadline is too long (${subheadline.length}/95). Reduce sentence length.` });

  if (callouts.length === 0) issues.push({ code: "callouts_missing", severity: "error", message: "At least one callout is required for scannable benefits." });
  if (callouts.length > 3) issues.push({ code: "callouts_overflow", severity: "error", message: "Too many callouts. Use up to 3 short benefit lines." });
  if (callouts.some((callout) => callout.length > 48)) issues.push({ code: "callout_line_overflow", severity: "error", message: "One or more callouts exceed 48 characters and may overflow." });

  if (!cta) issues.push({ code: "cta_missing", severity: "error", message: "CTA text is missing. Add an action-oriented label." });
  if (cta.length > 28) issues.push({ code: "cta_overflow", severity: "error", message: `CTA is too long (${cta.length}/28). Keep it concise.` });

  if (!input.screenshotUrls.length) {
    issues.push({ code: "screenshot_missing", severity: "error", message: "No screenshot is available for this frame. Upload product screenshots before generating." });
  }

  const bodyContrast = contrastRatio(palette.text, palette.panel);
  if (bodyContrast !== null && bodyContrast < 4.5) {
    issues.push({
      code: "body_contrast_low",
      severity: "error",
      message: `Text contrast is too low (${bodyContrast.toFixed(2)}:1). Adjust style preset or primary color for readability.`
    });
  }

  const ctaContrast = contrastRatio("#ffffff", palette.accent);
  if (ctaContrast !== null && ctaContrast < 3) {
    issues.push({
      code: "cta_contrast_low",
      severity: "warning",
      message: `CTA contrast is weak (${ctaContrast.toFixed(2)}:1). Consider a darker primary color for better legibility.`
    });
  }

  if (input.assetType.includes("hero") && headline.length < 18) {
    issues.push({
      code: "hero_headline_too_short",
      severity: "warning",
      message: "Hero headline is very short. Consider a stronger, more specific statement."
    });
  }

  return {
    pass: !issues.some((issue) => issue.severity === "error"),
    issues
  };
}
