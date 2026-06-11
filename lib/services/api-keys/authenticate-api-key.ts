import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getApiKeyLookupPrefix, hashApiKey, isCustomerApiKeyFormat, verifyApiKeyHash } from "@/lib/services/api-keys/hash";
import type { ApiKeyRecord, AuthenticatedApiCustomer } from "@/lib/services/api-keys/types";

const API_KEY_HEADER = "x-launchpix-api-key";

export function readCustomerApiKeyFromRequest(request: Request): string | null {
  const headerKey = request.headers.get(API_KEY_HEADER) ?? request.headers.get("x-api-key");
  if (headerKey?.trim()) return headerKey.trim();

  const bearer = request.headers.get("authorization");
  if (bearer?.toLowerCase().startsWith("bearer ")) {
    const token = bearer.slice(7).trim();
    return token || null;
  }

  return null;
}

function redactApiKeyForLogs(token: string): string {
  if (token.length <= 12) return "[redacted]";
  return `${token.slice(0, 12)}...`;
}

async function touchApiKeyLastUsed(apiKeyId: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", apiKeyId);
}

async function recordApiKeyAuthenticatedUsage(customer: AuthenticatedApiCustomer) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("usage_events").insert({
    user_id: customer.userId,
    project_id: null,
    event_type: "api_key_authenticated",
    metadata_json: {
      apiKeyId: customer.apiKeyId,
      keyPrefix: customer.keyPrefix
    }
  });
}

async function lookupApiKeyRecord(token: string): Promise<ApiKeyRecord | null> {
  const supabase = await createSupabaseServerClient();
  const keyPrefix = getApiKeyLookupPrefix(token);

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key_prefix", keyPrefix)
    .is("revoked_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const record = data as ApiKeyRecord;
  if (!verifyApiKeyHash(token, record.key_hash)) return null;

  return record;
}

export async function authenticateApiKey(request: Request): Promise<AuthenticatedApiCustomer | null> {
  const token = readCustomerApiKeyFromRequest(request);
  if (!token) return null;

  if (!isCustomerApiKeyFormat(token)) {
    console.info(
      `[launchpix:api-key] auth_rejected ${JSON.stringify({
        reason: "invalid_format",
        keyPreview: redactApiKeyForLogs(token)
      })}`
    );
    return null;
  }

  const record = await lookupApiKeyRecord(token);
  if (!record) {
    console.info(
      `[launchpix:api-key] auth_rejected ${JSON.stringify({
        reason: "not_found",
        keyPreview: redactApiKeyForLogs(token)
      })}`
    );
    return null;
  }

  const customer: AuthenticatedApiCustomer = {
    userId: record.user_id,
    apiKeyId: record.id,
    keyPrefix: record.key_prefix
  };

  await touchApiKeyLastUsed(record.id);
  await recordApiKeyAuthenticatedUsage(customer);

  return customer;
}

export function requireAuthenticatedApiCustomer(
  customer: AuthenticatedApiCustomer | null
): { customer: AuthenticatedApiCustomer } | { response: NextResponse } {
  if (customer) return { customer };

  return {
    response: NextResponse.json(
      {
        error: "Missing or invalid API key. Create a customer API key and send it as x-launchpix-api-key or Authorization: Bearer <key>."
      },
      { status: 401 }
    )
  };
}

export async function authenticateApiCustomerRequest(
  request: Request
): Promise<{ customer: AuthenticatedApiCustomer } | { response: NextResponse }> {
  const customer = await authenticateApiKey(request);
  return requireAuthenticatedApiCustomer(customer);
}

/** Test helper: derive stored hash for seeded keys without exposing pepper logic in tests. */
export function hashCustomerApiKeyForStorage(token: string): string {
  return hashApiKey(token);
}