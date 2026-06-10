import { NextResponse } from "next/server";
import { packIdFromVariantId, verifyLemonSqueezyWebhookSignature } from "@/lib/payments/lemon-squeezy";
import { grantCreditPack } from "@/lib/services/billing/subscription";
import { trackEvent } from "@/lib/services/analytics/events";
import { isCreditPackId, PLAN_CONFIG } from "@/lib/services/billing/plans";
import { logGenerationError, logGenerationEvent } from "@/lib/services/generations/logging";

export async function POST(req: Request) {
  const signature = req.headers.get("x-signature");
  const bodyText = await req.text();

  if (!verifyLemonSqueezyWebhookSignature(bodyText, signature)) {
    logGenerationEvent("warn", "billing_webhook_signature_mismatch", { source: "lemon_squeezy" });
    return NextResponse.json({ error: "Webhook signature mismatch" }, { status: 401 });
  }

  const body = JSON.parse(bodyText);
  const eventName = body.meta?.event_name as string | undefined;
  if (eventName !== "order_created") {
    logGenerationEvent("info", "billing_webhook_ignored_event", { eventName: eventName || "unknown" });
    return NextResponse.json({ ok: true });
  }

  const userId = body.meta?.custom_data?.user_id as string | undefined;
  const customPackId = body.meta?.custom_data?.pack_id as string | undefined;
  const variantId = body.data?.attributes?.first_order_item?.variant_id || body.data?.attributes?.variant_id;
  const packId = customPackId || packIdFromVariantId(variantId);
  const reference = String(body.data?.id || body.data?.attributes?.identifier || body.data?.attributes?.order_number || "");

  if (!packId || !isCreditPackId(packId) || !userId || !reference) {
    logGenerationEvent("warn", "billing_webhook_missing_metadata", {
      eventName,
      packId: packId || "unknown",
      userId: userId || "unknown",
      reference: reference || "unknown"
    });
    return NextResponse.json({ error: "Webhook payload missing required metadata" }, { status: 400 });
  }

  try {
    await grantCreditPack(userId, packId, reference);
    logGenerationEvent("info", "billing_webhook_credit_granted", { userId, packId, reference });
    await trackEvent({
      userId,
      eventType: "checkout_completed",
      metadata: {
        pack: PLAN_CONFIG[packId].label,
        provider: "lemon_squeezy",
        source: "webhook",
        reference,
        credits: PLAN_CONFIG[packId].creditsGranted,
        creditsPurchased: PLAN_CONFIG[packId].creditsGranted
      }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logGenerationError("billing_webhook_processing_failed", error, { userId, packId, reference });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
