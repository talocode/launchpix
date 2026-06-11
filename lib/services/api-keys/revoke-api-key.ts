import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapApiKeyToPublicMetadata, type PublicApiKeyMetadata } from "@/lib/services/api-keys/public-metadata";

export async function revokeCustomerApiKey(input: {
  userId: string;
  apiKeyId: string;
}): Promise<PublicApiKeyMetadata> {
  const supabase = await createSupabaseServerClient();
  const revokedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("api_keys")
    .update({ revoked_at: revokedAt })
    .eq("id", input.apiKeyId)
    .eq("user_id", input.userId)
    .is("revoked_at", null)
    .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("API key not found or already revoked.");

  return mapApiKeyToPublicMetadata(data);
}