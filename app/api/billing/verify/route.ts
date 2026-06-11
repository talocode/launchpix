import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/auth";
import { getAccessContext } from "@/lib/services/access/permissions";
import { logGenerationEvent } from "@/lib/services/generations/logging";

export async function POST(req: Request) {
  try {
    await req.json().catch(() => ({}));
    const { user } = await requireUser();
    const { subscription, plan } = await getAccessContext(user.id);

    logGenerationEvent("info", "billing_verification_checked", {
      userId: user.id,
      creditsRemaining: subscription.credits_remaining,
      plan: plan.id,
      status: subscription.status
    });

    return NextResponse.json({
      ok: true,
      credits_remaining: subscription.credits_remaining,
      plan: plan.id,
      status: subscription.status,
      last_payment_at: subscription.last_payment_at
    });
  } catch (error) {
    const maybeRedirectDigest = typeof error === "object" && error !== null ? String((error as { digest?: string }).digest || "") : "";
    if (maybeRedirectDigest.includes("NEXT_REDIRECT")) {
      return NextResponse.json({ error: "Please sign in to verify billing." }, { status: 401 });
    }

    return NextResponse.json({
      ok: false,
      message: "Lemon Squeezy purchases are confirmed by webhook. Credits will appear after the order_created event is received."
    });
  }
}
