import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateApiKeyToken, getApiKeyLookupPrefix, hashApiKey } from "@/lib/services/api-keys/hash";
import type { ApiKeyEnvironment } from "@/lib/services/api-keys/types";

export type CreateApiKeyResult = {
  apiKeyId: string;
  token: string;
  keyPrefix: string;
  name: string;
};

export async function createCustomerApiKey(input: {
  userId: string;
  name?: string;
  environment?: ApiKeyEnvironment;
}): Promise<CreateApiKeyResult> {
  const supabase = await createSupabaseServerClient();
  const token = generateApiKeyToken(input.environment ?? "live");
  const keyPrefix = getApiKeyLookupPrefix(token);
  const name = input.name?.trim() || "Default";

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      user_id: input.userId,
      name,
      key_prefix: keyPrefix,
      key_hash: hashApiKey(token)
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to create API key.");
  }

  return {
    apiKeyId: data.id,
    token,
    keyPrefix,
    name
  };
}