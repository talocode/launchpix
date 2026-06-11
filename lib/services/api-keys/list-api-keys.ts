import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapApiKeyToPublicMetadata, type PublicApiKeyMetadata } from "@/lib/services/api-keys/public-metadata";

export async function listCustomerApiKeys(userId: string): Promise<PublicApiKeyMetadata[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((record) => mapApiKeyToPublicMetadata(record));
}