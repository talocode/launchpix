import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/auth";
import { createCreditCheckout, validateCreditCheckoutConfig } from "@/lib/payments/lemon-squeezy";
import { trackEvent } from "@/lib/services/analytics/events";
import { isCreditPackId } from "@/lib/services/billing/plans";
import { buildAppUrl } from "@/lib/app-url";

export async function POST(req: Request) {
  try {
    const { user } = await requireUser();
    const body = (await req.json()) as { packId?: string; planId?: string };
    const packId = body.packId || body.planId;
    if (!packId || !isCreditPackId(packId)) return NextResponse.json({ error: "Credit pack selection is required." }, { status: 400 });

    const email = user.email;
    if (!email) return NextResponse.json({ error: "No verified email found for checkout." }, { status: 400 });

    await validateCreditCheckoutConfig(packId);

    await trackEvent({ userId: user.id, eventType: "checkout_started", metadata: { pack: packId, provider: "lemon_squeezy" } });

    const data = await createCreditCheckout({
      email,
      packId,
      userId: user.id,
      callbackUrl: buildAppUrl("/settings/billing?checkout=success", req)
    });

    return NextResponse.json({ checkout_url: data.checkoutUrl, authorization_url: data.checkoutUrl });
  } catch (error) {
    const maybeRedirectDigest = typeof error === "object" && error !== null ? String((error as { digest?: string }).digest || "") : "";
    if (maybeRedirectDigest.includes("NEXT_REDIRECT")) {
      return NextResponse.json({ error: "Please sign in to start checkout." }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Checkout could not start. Please try again.";
    console.error("Lemon Squeezy checkout failed:", message);

    if (message.includes("related resource does not exist") || message.includes("/data/relationships/store") || message.includes("/data/relationships/variant")) {
      return NextResponse.json(
        {
          error: "Checkout is not configured correctly. Confirm the Lemon Squeezy store ID and variant IDs belong to the same account as the API key."
        },
        { status: 500 }
      );
    }

    if (message.includes("is not configured") || message.includes("must be a numeric") || message.includes("belongs to Lemon Squeezy store")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ error: "Checkout could not start. Please try again." }, { status: 500 });
  }
}
