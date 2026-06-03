/** UI-only placeholders until per-user API keys and billing meters ship. */

export type ApiKeyRow = {
  id: string;
  partialKey: string;
  createdAt: string;
  status: "active" | "revoked";
};

export const MOCK_API_KEYS: ApiKeyRow[] = [];

export const MOCK_METRICS = {
  availableCreditsUsd: "$0.00",
  totalSpentUsd: "$0.00",
  totalIssuedUsd: "$0.00",
  activeApiKeys: 0
};

export const MOCK_SETUP = {
  hasPaymentMethod: false,
  hasApiKey: false
};