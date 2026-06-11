import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { ApiKeyEnvironment } from "@/lib/services/api-keys/types";

const API_KEY_PREFIX_PATTERN = /^lp_(live|test)_[A-Za-z0-9_-]{20,}$/;

export function generateApiKeyToken(environment: ApiKeyEnvironment = "live"): string {
  return `lp_${environment}_${randomBytes(24).toString("base64url")}`;
}

export function isCustomerApiKeyFormat(token: string): boolean {
  return API_KEY_PREFIX_PATTERN.test(token);
}

export function getApiKeyLookupPrefix(token: string): string {
  return token.slice(0, 16);
}

export function hashApiKey(token: string): string {
  const pepper = process.env.LAUNCHPIX_API_KEY_PEPPER ?? "";
  return createHash("sha256").update(`${pepper}:${token}`).digest("hex");
}

export function verifyApiKeyHash(token: string, storedHash: string): boolean {
  const computed = hashApiKey(token);
  const computedBuffer = Buffer.from(computed, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (computedBuffer.length !== storedBuffer.length) return false;
  return timingSafeEqual(computedBuffer, storedBuffer);
}