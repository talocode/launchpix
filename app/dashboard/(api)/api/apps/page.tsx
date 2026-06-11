import Link from "next/link";
import { ApiPageHeader } from "@/components/api-dashboard/api-page-header";
import { EmptyState } from "@/components/api-dashboard/empty-state";

export default function ApiAppsPage() {
  return (
    <div>
      <ApiPageHeader
        title="Apps"
        subtitle="Connect LaunchPix to agents, apps, and launch workflows."
      />
      <EmptyState
        title="No connected apps yet"
        description="Register apps to scope API keys and monitor usage by integration."
        action={
          <Link
            href="/docs/api"
            className="inline-flex rounded-lg bg-[#f5f5f5] px-4 py-2 text-sm font-medium text-[#050505] hover:opacity-90"
          >
            View documentation
          </Link>
        }
      />
    </div>
  );
}