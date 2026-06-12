import type { ReactNode } from "react";
import { ApiDashboardShell } from "@/components/api-dashboard/api-dashboard-shell";
import { MOCK_SETUP } from "@/lib/api-dashboard/mock-data";
import { listCustomerApiKeys } from "@/lib/services/api-keys/list-api-keys";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function ApiPlatformLayout({ children }: { children: ReactNode }) {
  const { user } = await requireUser();
  const keys = await listCustomerApiKeys(user.id).catch(() => []);
  const hasActiveApiKey = keys.some((key) => key.status === "active");

  const setup = {
    hasPaymentMethod: MOCK_SETUP.hasPaymentMethod,
    hasApiKey: hasActiveApiKey
  };

  return (
    <ApiDashboardShell setup={setup} userEmail={user.email ?? "developer@launchpix.dev"}>
      {children}
    </ApiDashboardShell>
  );
}