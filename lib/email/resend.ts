import { Resend } from "resend";
import { renderEmailTemplate, type EmailTemplateName } from "@/lib/email/templates";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_FROM = "Talocode LaunchPix <onboarding@resend.dev>";

let resendClient: Resend | null = null;

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  resendClient ??= new Resend(apiKey);
  return resendClient;
}

export async function getUserEmail(userId: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) {
    console.warn("Unable to load user email for Resend notification:", error.message);
    return null;
  }

  return data.user?.email ?? null;
}

export async function getProjectName(projectId?: string) {
  if (!projectId) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("projects").select("name").eq("id", projectId).maybeSingle();

  return data?.name ?? null;
}

export async function sendLaunchPixEmail(input: {
  to: string | null | undefined;
  template: EmailTemplateName;
  data?: Parameters<typeof renderEmailTemplate>[1];
}) {
  const resend = getResend();
  const to = input.to;

  if (!resend || !to) return { skipped: true as const };

  const email = renderEmailTemplate(input.template, input.data);
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  const result = await resend.emails.send({
    from,
    to,
    subject: email.subject,
    html: email.html,
    tags: [
      { name: "app", value: "launchpix" },
      { name: "template", value: input.template }
    ]
  });

  if (result.error) {
    console.warn("Resend email failed:", result.error.message);
  }

  return result;
}

export async function sendLifecycleEmail(input: {
  userId: string;
  eventType: string;
  projectId?: string;
  metadata?: Record<string, unknown>;
}) {
  const templateByEvent: Partial<Record<string, EmailTemplateName>> = {
    project_created: "projectCreated",
    screenshots_uploaded: "screenshotsUploaded",
    generation_started: "generationStarted",
    generation_completed: "generationCompleted",
    generation_failed: "generationFailed",
    checkout_completed: "paymentSucceeded",
    asset_downloaded: "assetDownloaded",
    zip_export_requested: "zipExported",
    credits_low: "creditsLow"
  };

  const template = templateByEvent[input.eventType];
  if (!template) return { skipped: true as const };

  const [to, projectName] = await Promise.all([
    getUserEmail(input.userId),
    getProjectName(input.projectId)
  ]);

  await sendResendEvent({
    to,
    eventType: input.eventType,
    metadata: input.metadata,
    projectId: input.projectId,
    projectName: typeof input.metadata?.projectName === "string" ? input.metadata.projectName : projectName ?? undefined
  }).catch((error) => {
    console.warn("Resend event automation failed:", error instanceof Error ? error.message : error);
  });

  return sendLaunchPixEmail({
    to,
    template,
    data: {
      projectId: input.projectId,
      generationId: typeof input.metadata?.generationId === "string" ? input.metadata.generationId : undefined,
      projectName: typeof input.metadata?.projectName === "string" ? input.metadata.projectName : projectName ?? undefined,
      errorMessage: typeof input.metadata?.message === "string" ? input.metadata.message : undefined,
      planLabel: typeof input.metadata?.pack === "string" ? input.metadata.pack : typeof input.metadata?.plan === "string" ? input.metadata.plan : undefined,
      credits: typeof input.metadata?.credits === "number" ? input.metadata.credits : undefined
    }
  });
}

async function sendResendEvent(input: {
  to: string | null;
  eventType: string;
  projectId?: string;
  projectName?: string;
  metadata?: Record<string, unknown>;
}) {
  const resend = getResend();
  if (!resend || !input.to) return { skipped: true as const };

  const eventMap: Record<string, string> = {
    project_created: "project.created",
    screenshots_uploaded: "screenshots.uploaded",
    generation_started: "generation.started",
    generation_completed: "generation.completed",
    generation_failed: "generation.failed",
    checkout_completed: "payment.succeeded",
    asset_downloaded: "asset.downloaded",
    zip_export_requested: "zip.exported",
    credits_low: "credits.low"
  };

  const event = eventMap[input.eventType];
  if (!event) return { skipped: true as const };

  return resend.events.send({
    event,
    email: input.to,
    payload: {
      projectId: input.projectId,
      projectName: input.projectName,
      ...input.metadata
    }
  });
}
