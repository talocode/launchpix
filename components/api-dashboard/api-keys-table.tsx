import type { ApiKeyRow } from "@/components/api-dashboard/types";
import { EmptyState } from "@/components/api-dashboard/empty-state";

type ApiKeysTableProps = {
  keys: ApiKeyRow[];
  onRevoke?: (apiKeyId: string) => void;
  revokingId?: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function ApiKeysTable({ keys, onRevoke, revokingId }: ApiKeysTableProps) {
  if (!keys.length) {
    return (
      <EmptyState
        title="No API key yet"
        description="Create a customer API key to call the LaunchPix API. Only the key prefix is shown after creation."
      />
    );
  }

  return (
    <div className="api-dashboard-card overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#111111]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.08)] text-xs text-[#8a8a8a]">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Prefix</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 font-medium">Last used</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b border-[rgba(255,255,255,0.06)] last:border-0">
                <td className="px-5 py-4 text-[#f5f5f5]">{key.name}</td>
                <td className="px-5 py-4 font-mono text-[#f5f5f5]">{key.prefix}</td>
                <td className="px-5 py-4 text-[#a1a1a1]">{formatDate(key.createdAt)}</td>
                <td className="px-5 py-4 text-[#a1a1a1]">{formatDate(key.lastUsedAt)}</td>
                <td className="px-5 py-4">
                  <span className={key.status === "active" ? "text-[#9ed49e]" : "text-[#8a8a8a]"}>
                    {key.status === "active" ? "Active" : "Revoked"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {key.status === "active" && onRevoke ? (
                    <button
                      type="button"
                      onClick={() => onRevoke(key.id)}
                      disabled={revokingId === key.id}
                      className="rounded-md border border-[rgba(255,255,255,0.12)] px-3 py-1.5 text-xs text-[#f2a3a3] hover:bg-[#1d1d1d] disabled:opacity-50"
                    >
                      {revokingId === key.id ? "Revoking..." : "Revoke"}
                    </button>
                  ) : (
                    <span className="text-xs text-[#666]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}