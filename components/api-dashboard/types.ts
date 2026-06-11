export type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  status: "active" | "revoked";
};

export type ApiSetupState = {
  hasPaymentMethod: boolean;
  hasApiKey: boolean;
};