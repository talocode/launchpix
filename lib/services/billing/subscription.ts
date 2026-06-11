import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FREE_SIGNUP_CREDITS, PLAN_CONFIG, type CreditPackId } from "@/lib/services/billing/plans";

function fallbackSubscription(userId: string) {
  return {
    id: `fallback-${userId}`,
    user_id: userId,
    plan: "credits",
    status: "active",
    credits_remaining: FREE_SIGNUP_CREDITS,
    provider: "lemon_squeezy",
    provider_reference: null,
    last_payment_at: null
  } as any;
}

async function raiseLegacyBalance(userId: string, subscription: any) {
  if (subscription.credits_remaining >= FREE_SIGNUP_CREDITS && subscription.plan === "credits") return subscription;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      plan: "credits",
      status: "active",
      credits_remaining: Math.max(subscription.credits_remaining ?? 0, FREE_SIGNUP_CREDITS),
      provider: subscription.provider || "lemon_squeezy"
    })
    .eq("id", subscription.id)
    .eq("user_id", userId)
    .select("*")
    .single();

  return error || !data ? subscription : data;
}

export async function getOrCreateSubscription(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    if (data) return raiseLegacyBalance(userId, data);

    const { data: created, error: createError } = await supabase
      .from("subscriptions")
      .insert({ user_id: userId, plan: "credits", status: "active", credits_remaining: FREE_SIGNUP_CREDITS, provider: "lemon_squeezy" })
      .select("*")
      .single();

    if (createError || !created) return fallbackSubscription(userId);
    return created;
  } catch {
    return fallbackSubscription(userId);
  }
}

export type GenerationCreditContext = {
  generationId: string;
  projectId: string;
  apiKeyId?: string;
};

export async function consumeGenerationCredit(userId: string, context?: GenerationCreditContext) {
  const supabase = await createSupabaseServerClient();
  const current = await getOrCreateSubscription(userId);
  if (current.credits_remaining <= 0) throw new Error("No credits remaining. Buy credits to continue generating.");

  const { data, error } = await supabase
    .from("subscriptions")
    .update({ credits_remaining: current.credits_remaining - 1 })
    .eq("id", current.id)
    .eq("credits_remaining", current.credits_remaining)
    .select("*")
    .single();

  if (error || !data) throw new Error("Could not reserve credit. Please retry.");

  if (context) {
    await supabase.from("usage_events").insert({
      user_id: userId,
      project_id: context.projectId,
      event_type: "generation_credit_consumed",
      metadata_json: {
        generationId: context.generationId,
        apiKeyId: context.apiKeyId ?? null,
        creditsRemaining: data.credits_remaining
      }
    });
  }

  return data;
}

export async function refundGenerationCredit(userId: string, reason: string, generationId?: string) {
  const supabase = await createSupabaseServerClient();
  const current = await getOrCreateSubscription(userId);

  const { data, error } = await supabase
    .from("subscriptions")
    .update({ credits_remaining: current.credits_remaining + 1 })
    .eq("id", current.id)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message || "Could not refund generation credit.");

  await supabase.from("usage_events").insert({
    user_id: userId,
    project_id: null,
    event_type: "generation_credit_refunded",
    metadata_json: { reason, generationId }
  });

  return data;
}

export async function grantCreditPack(userId: string, packId: CreditPackId, providerRef: string) {
  const supabase = await createSupabaseServerClient();
  await getOrCreateSubscription(userId);
  const pack = PLAN_CONFIG[packId];

  const { error } = await supabase.rpc("grant_credit_pack_atomic", {
    p_user_id: userId,
    p_source: "lemon_squeezy",
    p_provider_reference: providerRef,
    p_credits: pack.creditsGranted,
    p_metadata: { packId }
  });

  if (error) throw new Error(error.message);
}
