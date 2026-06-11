import crypto from "crypto";
import { CREDIT_PACKS, getCreditPack, type CreditPackId } from "@/lib/services/billing/plans";

const LEMON_SQUEEZY_BASE_URL = "https://api.lemonsqueezy.com/v1";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function getVariantId(packId: CreditPackId) {
  const pack = getCreditPack(packId);
  if (!pack) throw new Error("Unknown credit pack");
  return requiredEnv(pack.variantEnvKey);
}

function requireNumericEnv(name: string) {
  const value = requiredEnv(name).trim();
  if (!/^\d+$/.test(value)) throw new Error(`${name} must be a numeric Lemon Squeezy ID`);
  return value;
}

async function lemonSqueezyRequest(path: string, init: RequestInit) {
  const apiKey = requiredEnv("LEMON_SQUEEZY_API_KEY");

  const res = await fetch(`${LEMON_SQUEEZY_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/vnd.api+json",
      ...(init.headers || {})
    }
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errors = Array.isArray(json?.errors) ? json.errors : [];
    const details = errors
      .map((error: { detail?: string; source?: { pointer?: string }; title?: string }) => {
        const location = error.source?.pointer ? ` at ${error.source.pointer}` : "";
        return `${error.detail || error.title || "Unknown Lemon Squeezy error"}${location}`;
      })
      .filter(Boolean)
      .join("; ");

    throw new Error(details || json?.message || "Lemon Squeezy request failed");
  }
  return json;
}

export async function createCreditCheckout(input: {
  email: string;
  packId: CreditPackId;
  userId: string;
  callbackUrl: string;
}) {
  const pack = getCreditPack(input.packId);
  if (!pack) throw new Error("Unknown credit pack");
  const storeId = requireNumericEnv("LEMON_SQUEEZY_STORE_ID");
  const variantId = requireNumericEnv(pack.variantEnvKey);

  const json = await lemonSqueezyRequest("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          product_options: {
            name: pack.label,
            description: `${pack.creditsGranted} Talocode LaunchPix credits`,
            redirect_url: input.callbackUrl,
            receipt_button_text: "Return to Talocode LaunchPix",
            receipt_link_url: input.callbackUrl,
            enabled_variants: [Number(variantId)]
          },
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
            desc: true,
            discount: true,
            button_color: "#6d5dfc"
          },
          checkout_data: {
            email: input.email,
            custom: {
              user_id: input.userId,
              pack_id: input.packId,
              credits: pack.creditsGranted
            },
            custom_data: {
              user_id: input.userId,
              pack_id: input.packId,
              credits: pack.creditsGranted
            }
          }
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: storeId
            }
          },
          variant: {
            data: {
              type: "variants",
              id: variantId
            }
          }
        }
      }
    })
  });

  const url = json?.data?.attributes?.url;
  if (!url) throw new Error("Lemon Squeezy did not return a checkout URL");
  return { checkoutUrl: url };
}

export async function validateCreditCheckoutConfig(packId: CreditPackId) {
  const pack = getCreditPack(packId);
  if (!pack) throw new Error("Unknown credit pack");

  const storeId = requireNumericEnv("LEMON_SQUEEZY_STORE_ID");
  const variantId = requireNumericEnv(pack.variantEnvKey);
  const json = await lemonSqueezyRequest(`/variants/${variantId}`, { method: "GET" });
  const variantStoreId = String(json?.data?.relationships?.store?.data?.id || "");

  if (variantStoreId && variantStoreId !== storeId) {
    throw new Error(`${pack.variantEnvKey} belongs to Lemon Squeezy store ${variantStoreId}, but LEMON_SQUEEZY_STORE_ID is ${storeId}`);
  }

  return { storeId, variantId };
}

export function verifyLemonSqueezyWebhookSignature(body: string, signature: string | null) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const digest = Buffer.from(crypto.createHmac("sha256", secret).update(body).digest("hex"), "utf8");
  const received = Buffer.from(signature, "utf8");
  if (digest.length !== received.length) return false;
  return crypto.timingSafeEqual(digest, received);
}

export function packIdFromVariantId(variantId: string | number | null | undefined): CreditPackId | null {
  const id = String(variantId || "");
  const pack = CREDIT_PACKS.find((item) => process.env[item.variantEnvKey] === id);
  return pack?.id ?? null;
}
