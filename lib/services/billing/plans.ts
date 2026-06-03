export const FREE_SIGNUP_CREDITS = 300;

export type CreditPackId = "starter_credits" | "creator_credits" | "studio_credits";
export type PlanId = "credits" | CreditPackId;
export type BillingType = "free_grant" | "credit_pack";

export interface PlanConfig {
  id: PlanId;
  label: string;
  billingType: BillingType;
  creditsGranted: number;
  fullResolutionExport: boolean;
  zipExport: boolean;
  watermarkPreview: boolean;
  commercialUse: boolean;
  priorityGeneration: boolean;
  maxProjects: number | null;
}

export interface CreditPackConfig {
  id: CreditPackId;
  label: string;
  description: string;
  creditsGranted: number;
  priceLabel: string;
  variantEnvKey: string;
  featured?: boolean;
}

export const PLAN_CONFIG: Record<PlanId, PlanConfig> = {
  credits: {
    id: "credits",
    label: "Credit balance",
    billingType: "free_grant",
    creditsGranted: FREE_SIGNUP_CREDITS,
    fullResolutionExport: true,
    zipExport: true,
    watermarkPreview: false,
    commercialUse: true,
    priorityGeneration: false,
    maxProjects: null
  },
  starter_credits: {
    id: "starter_credits",
    label: "Starter credits",
    billingType: "credit_pack",
    creditsGranted: 150,
    fullResolutionExport: true,
    zipExport: true,
    watermarkPreview: false,
    commercialUse: true,
    priorityGeneration: false,
    maxProjects: null
  },
  creator_credits: {
    id: "creator_credits",
    label: "Creator credits",
    billingType: "credit_pack",
    creditsGranted: 500,
    fullResolutionExport: true,
    zipExport: true,
    watermarkPreview: false,
    commercialUse: true,
    priorityGeneration: false,
    maxProjects: null
  },
  studio_credits: {
    id: "studio_credits",
    label: "Studio credits",
    billingType: "credit_pack",
    creditsGranted: 1200,
    fullResolutionExport: true,
    zipExport: true,
    watermarkPreview: false,
    commercialUse: true,
    priorityGeneration: false,
    maxProjects: null
  }
};

export const CREDIT_PACKS: CreditPackConfig[] = [
  {
    id: "starter_credits",
    label: "Launch credits",
    description: "A small one-time top-up for your next generation run.",
    creditsGranted: PLAN_CONFIG.starter_credits.creditsGranted,
    priceLabel: "$1 / credit",
    variantEnvKey: "LEMON_SQUEEZY_STARTER_CREDITS_VARIANT_ID"
  },
  {
    id: "creator_credits",
    label: "Growth credits",
    description: "For repeated launch runs across more than one project or channel.",
    creditsGranted: PLAN_CONFIG.creator_credits.creditsGranted,
    priceLabel: "Volume discount",
    variantEnvKey: "LEMON_SQUEEZY_CREATOR_CREDITS_VARIANT_ID",
    featured: true
  },
  {
    id: "studio_credits",
    label: "Scale credits",
    description: "For teams shipping launch assets regularly through the API.",
    creditsGranted: PLAN_CONFIG.studio_credits.creditsGranted,
    priceLabel: "Best value",
    variantEnvKey: "LEMON_SQUEEZY_STUDIO_CREDITS_VARIANT_ID"
  }
];

export const PLAN_ORDER: PlanId[] = ["credits", "starter_credits", "creator_credits", "studio_credits"];

export function isCreditPackId(value: string): value is CreditPackId {
  return CREDIT_PACKS.some((pack) => pack.id === value);
}

export function getCreditPack(packId: CreditPackId) {
  return CREDIT_PACKS.find((pack) => pack.id === packId);
}
