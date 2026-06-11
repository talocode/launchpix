import {
  consumeGenerationCredit,
  getOrCreateSubscription,
  refundGenerationCredit,
  type GenerationCreditContext
} from "@/lib/services/billing/subscription";
import { PLAN_CONFIG } from "@/lib/services/billing/plans";

export type { GenerationCreditContext };

export async function consumeForGeneration(userId: string, context?: GenerationCreditContext) {
  const subscription = await consumeGenerationCredit(userId, context);
  const plan = PLAN_CONFIG[(subscription.plan as keyof typeof PLAN_CONFIG) || "credits"] || PLAN_CONFIG.credits;
  return { subscription, plan };
}

export async function refundForGeneration(userId: string, reason: string, generationId: string) {
  return refundGenerationCredit(userId, reason, generationId);
}

export async function getUserBillingState(userId: string) {
  return getOrCreateSubscription(userId);
}