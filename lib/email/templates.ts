import { buildAppUrl } from "@/lib/app-url";

const brand = {
  bg: "#02040a",
  panel: "#070b12",
  border: "#1d2430",
  text: "#f7f9fc",
  muted: "#9aa4b2",
  accent: "#5b5ff7"
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function baseEmail(input: { eyebrow: string; title: string; body: string; ctaLabel?: string; ctaHref?: string; footer?: string }) {
  const footer = input.footer || "Talocode LaunchPix sends operational emails about your projects, generations, billing, and exports.";

  return `<!doctype html>
<html>
  <body style="margin:0;background:${brand.bg};font-family:Inter,Segoe UI,Arial,sans-serif;color:${brand.text};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border:1px solid ${brand.border};border-radius:24px;background:${brand.panel};overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 20px;">
                <div style="font-size:18px;font-weight:700;letter-spacing:-0.02em;">Talocode LaunchPix</div>
                <div style="margin-top:28px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${brand.muted};">${escapeHtml(input.eyebrow)}</div>
                <h1 style="margin:12px 0 0;font-size:28px;line-height:1.12;letter-spacing:-0.04em;color:${brand.text};">${escapeHtml(input.title)}</h1>
                <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:${brand.muted};">${escapeHtml(input.body)}</p>
                ${
                  input.ctaLabel && input.ctaHref
                    ? `<a href="${input.ctaHref}" style="display:inline-block;margin-top:24px;border-radius:14px;background:${brand.accent};padding:12px 16px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">${escapeHtml(input.ctaLabel)}</a>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid ${brand.border};padding:18px 28px 24px;font-size:12px;line-height:1.6;color:#697386;">
                ${escapeHtml(footer)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export type EmailTemplateName =
  | "welcome"
  | "projectCreated"
  | "screenshotsUploaded"
  | "generationStarted"
  | "generationCompleted"
  | "generationFailed"
  | "paymentSucceeded"
  | "assetDownloaded"
  | "zipExported"
  | "creditsLow";

export function renderEmailTemplate(
  template: EmailTemplateName,
  input: {
    projectName?: string;
    errorMessage?: string;
    planLabel?: string;
    credits?: number;
    projectId?: string;
    generationId?: string;
  } = {}
) {
  const projectName = input.projectName || "your Talocode LaunchPix project";
  const projectUrl = input.projectId ? buildAppUrl(`/dashboard/projects/${input.projectId}`) : buildAppUrl("/dashboard/projects");
  const assetsUrl = input.projectId ? buildAppUrl(`/dashboard/projects/${input.projectId}/assets`) : buildAppUrl("/dashboard/projects");
  const billingUrl = buildAppUrl("/settings/billing");

  const map: Record<EmailTemplateName, { subject: string; html: string }> = {
    welcome: {
      subject: "Welcome to Talocode LaunchPix",
      html: baseEmail({
        eyebrow: "Welcome",
        title: "Your Talocode LaunchPix workspace is ready.",
        body: "Create a project brief, upload screenshots, generate launch visuals, and export the final pack from one focused workspace.",
        ctaLabel: "Open dashboard",
        ctaHref: buildAppUrl("/dashboard")
      })
    },
    projectCreated: {
      subject: `Project created: ${projectName}`,
      html: baseEmail({
        eyebrow: "Project created",
        title: `${projectName} is ready for screenshots.`,
        body: "Upload the product screens you want to turn into launch visuals. Talocode LaunchPix will use them to build the final asset story.",
        ctaLabel: "Continue project",
        ctaHref: projectUrl
      })
    },
    screenshotsUploaded: {
      subject: `Screenshots uploaded for ${projectName}`,
      html: baseEmail({
        eyebrow: "Screenshots uploaded",
        title: "Your screenshot stack was updated.",
        body: `${projectName} now has fresh source material for generation. Review the sequence before starting the asset pack.`,
        ctaLabel: "Review project",
        ctaHref: projectUrl
      })
    },
    generationStarted: {
      subject: `Generation started for ${projectName}`,
      html: baseEmail({
        eyebrow: "Generation started",
        title: "Talocode LaunchPix is building your asset pack.",
        body: "We are reading your brief, preparing the copy structure, and rendering the launch visuals.",
        ctaLabel: "View status",
        ctaHref: projectUrl
      })
    },
    generationCompleted: {
      subject: `Your Talocode LaunchPix pack is ready: ${projectName}`,
      html: baseEmail({
        eyebrow: "Pack ready",
        title: "Your launch assets are ready to review.",
        body: `${projectName} now has generated listing frames, a promo tile, a hero banner, and an export package.`,
        ctaLabel: "View assets",
        ctaHref: assetsUrl
      })
    },
    generationFailed: {
      subject: `Generation needs attention: ${projectName}`,
      html: baseEmail({
        eyebrow: "Generation failed",
        title: "The asset generation did not complete.",
        body: input.errorMessage || "Talocode LaunchPix could not complete the render. Open the project to retry or adjust the inputs.",
        ctaLabel: "Open project",
        ctaHref: projectUrl
      })
    },
    paymentSucceeded: {
      subject: "Talocode LaunchPix payment confirmed",
      html: baseEmail({
        eyebrow: "Payment confirmed",
        title: `${input.planLabel || "Your credit pack"} is active.`,
        body: `Your workspace credits were updated${typeof input.credits === "number" ? ` to ${input.credits}` : ""}. You can now continue generating and exporting launch assets.`,
        ctaLabel: "Manage billing",
        ctaHref: billingUrl
      })
    },
    assetDownloaded: {
      subject: `Asset downloaded from ${projectName}`,
      html: baseEmail({
        eyebrow: "Asset downloaded",
        title: "A launch asset was downloaded.",
        body: "This confirms an asset was requested from your Talocode LaunchPix workspace.",
        ctaLabel: "View project",
        ctaHref: projectUrl
      })
    },
    zipExported: {
      subject: `ZIP export requested for ${projectName}`,
      html: baseEmail({
        eyebrow: "ZIP export",
        title: "Your launch pack ZIP was requested.",
        body: "The export package contains the generated assets for this project.",
        ctaLabel: "View assets",
        ctaHref: assetsUrl
      })
    },
    creditsLow: {
      subject: "Talocode LaunchPix credits are low",
      html: baseEmail({
        eyebrow: "Credits low",
        title: "Add credits to keep generating launch packs.",
        body: `Your workspace has ${input.credits ?? 0} credits remaining. Buy a one-time credit pack before your next generation run.`,
        ctaLabel: "Manage billing",
        ctaHref: billingUrl
      })
    }
  };

  return map[template];
}
