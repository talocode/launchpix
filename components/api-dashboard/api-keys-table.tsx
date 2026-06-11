import type { ApiKeyRow } from "@/lib/api-dashboard/mock-data";
import { EmptyState } from "@/components/api-dashboard/empty-state";

export function ApiKeysTable({ keys }: { keys: ApiKeyRow[] }) {
  if (!keys.length) {
    return (
      <EmptyState
        title="No API key yet"
        description="Create a key to authenticate requests to LaunchPix. Keys are shown partially for security."
      />
    );
  }

  return (
    <div className="api-dashboard-card overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#111111]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.08)] text-xs text-[#8a8a8a]">
              <th className="px-5 py-3 font-medium">Partial key</th>
              <th className="px-5 py-3 font-medium">Date created</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b border-[rgba(255,255,255,0.06)] last:border-0">
                <td className="px-5 py-4 font-mono text-[#f5f5f5]">{key.partialKey}</td>
                <td className="px-5 py-4 text-[#a1a1a1]">{key.createdAt}</td>
                <td className="px-5 py-4">
                  <span
                    className={
                      key.status === "active"
                        ? "text-[#9ed49e]"
                        : "text-[#8a8a8a]"
                    }
                  >
                    {key.status === "active" ? "Active" : "Revoked"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}