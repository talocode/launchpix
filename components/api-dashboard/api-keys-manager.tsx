"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiKeysTable } from "@/components/api-dashboard/api-keys-table";
import { ApiPageHeader } from "@/components/api-dashboard/api-page-header";
import type { ApiKeyRow } from "@/components/api-dashboard/types";

type CreatedKeyResponse = {
  key: {
    id: string;
    name: string;
    prefix: string;
    token: string;
  };
  warning: string;
};

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [createdWarning, setCreatedWarning] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard/api-keys", { cache: "no-store" });
      const payload = (await response.json()) as { keys?: ApiKeyRow[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not load API keys.");
      setKeys(payload.keys ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load API keys.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  async function handleCreateKey(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setCreatedToken(null);
    setCreatedWarning(null);

    try {
      const response = await fetch("/api/dashboard/api-keys", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() || "Default" })
      });
      const payload = (await response.json()) as CreatedKeyResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not create API key.");

      setCreatedToken(payload.key.token);
      setCreatedWarning(payload.warning);
      setShowCreateForm(false);
      setNewKeyName("");
      await loadKeys();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create API key.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(apiKeyId: string) {
    if (!window.confirm("Revoke this API key? Requests using it will stop working immediately.")) return;

    setRevokingId(apiKeyId);
    setError(null);

    try {
      const response = await fetch("/api/dashboard/api-keys", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ apiKeyId })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not revoke API key.");
      await loadKeys();
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Could not revoke API key.");
    } finally {
      setRevokingId(null);
    }
  }

  async function copyCreatedToken() {
    if (!createdToken) return;
    await navigator.clipboard.writeText(createdToken);
  }

  return (
    <div>
      <ApiPageHeader
        title="API Keys"
        subtitle="Create customer API keys to authenticate LaunchPix API requests. Keys are hashed at rest and shown only once at creation."
        action={
          <button
            type="button"
            onClick={() => setShowCreateForm((open) => !open)}
            className="rounded-lg bg-[#f5f5f5] px-4 py-2 text-sm font-medium text-[#050505] transition-opacity hover:opacity-90"
          >
            Create key
          </button>
        }
      />

      {error ? <p className="mb-4 text-sm text-[#f2a3a3]">{error}</p> : null}

      {createdToken ? (
        <div className="mb-6 rounded-[14px] border border-[rgba(255,255,255,0.12)] bg-[#151515] p-5">
          <p className="text-sm font-medium text-[#f5f5f5]">Copy your new API key now</p>
          <p className="mt-2 text-sm text-[#a1a1a1]">{createdWarning}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 overflow-x-auto rounded-lg bg-[#0b0b0b] px-4 py-3 font-mono text-sm text-[#f5f5f5]">{createdToken}</code>
            <button
              type="button"
              onClick={() => void copyCreatedToken()}
              className="rounded-lg border border-[rgba(255,255,255,0.12)] px-4 py-2 text-sm text-[#f5f5f5] hover:bg-[#1d1d1d]"
            >
              Copy key
            </button>
          </div>
        </div>
      ) : null}

      {showCreateForm ? (
        <form onSubmit={(event) => void handleCreateKey(event)} className="mb-6 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#111111] p-5">
          <label className="block text-sm text-[#d4d4d4]">
            Key name
            <input
              value={newKeyName}
              onChange={(event) => setNewKeyName(event.target.value)}
              placeholder="Production server"
              className="mt-2 w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#0b0b0b] px-3 py-2 text-sm text-[#f5f5f5] outline-none"
            />
          </label>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-[#f5f5f5] px-4 py-2 text-sm font-medium text-[#050505] disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create key"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded-lg border border-[rgba(255,255,255,0.12)] px-4 py-2 text-sm text-[#d4d4d4]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {loading ? <p className="text-sm text-[#8a8a8a]">Loading API keys...</p> : <ApiKeysTable keys={keys} onRevoke={(id) => void handleRevoke(id)} revokingId={revokingId} />}
    </div>
  );
}