import type { ReactNode } from "react";
import { ApiDashboardShell } from "@/components/api-dashboard/api-dashboard-shell";
import { MOCK_API_KEYS, MOCK_SETUP } from "@/lib/api-dashboard/mock-data";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function ApiPlatformLayout({ children }: { children: ReactNode }) {
  const { user } = await requireUser();

  const setup = {
    hasPaymentMethod: MOCK_SETUP.hasPaymentMethod,
    hasApiKey: MOCK_SETUP.hasApiKey || MOCK_API_KEYS.length > 0
  };

  return (
    <ApiDashboardShell setup={setup} userEmail={user.email ?? "developer@launchpix.dev"}>
      {children}
    </ApiDashboardShell>
  );
}