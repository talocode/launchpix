import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapApiKeyToPublicMetadata, type PublicApiKeyMetadata } from "@/lib/services/api-keys/public-metadata";

export async function renameCustomerApiKey(input: {
  userId: string;
  apiKeyId: string;
  name: string;
}): Promise<PublicApiKeyMetadata> {
  const name = input.name.trim();
  if (!name) throw new Error("API key name is required.");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("api_keys")
    .update({ name })
    .eq("id", input.apiKeyId)
    .eq("user_id", input.userId)
    .is("revoked_at", null)
    .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("API key not found or revoked.");

  return mapApiKeyToPublicMetadata(data);
}