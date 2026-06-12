import type { ApiKeyRecord } from "@/lib/services/api-keys/types";

export type PublicApiKeyMetadata = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  status: "active" | "revoked";
};

export function mapApiKeyToPublicMetadata(record: Pick<ApiKeyRecord, "id" | "name" | "key_prefix" | "created_at" | "last_used_at" | "revoked_at">): PublicApiKeyMetadata {
  return {
    id: record.id,
    name: record.name,
    prefix: `${record.key_prefix}...`,
    createdAt: record.created_at,
    lastUsedAt: record.last_used_at,
    revokedAt: record.revoked_at,
    status: record.revoked_at ? "revoked" : "active"
  };
}