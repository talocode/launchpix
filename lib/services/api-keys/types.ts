export type ApiKeyEnvironment = "live" | "test";

export type ApiKeyRecord = {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type AuthenticatedApiCustomer = {
  userId: string;
  apiKeyId: string;
  keyPrefix: string;
};