import type { ReactNode } from "react";
import { ApiAlertBanner } from "@/components/api-dashboard/api-alert-banner";
import { ApiSidebar } from "@/components/api-dashboard/api-sidebar";
import type { ApiSetupState } from "@/components/api-dashboard/types";

export function ApiDashboardShell({
  children,
  setup,
  userEmail
}: {
  children: ReactNode;
  setup: ApiSetupState;
  userEmail: string;
}) {
  const showAlert = !setup.hasPaymentMethod || !setup.hasApiKey;

  return (
    <div className="api-dashboard min-h-screen bg-[#050505] text-[#f5f5f5]">
      <ApiSidebar userEmail={userEmail} />
      <div className="api-dashboard-main flex min-h-screen min-w-0 flex-1 flex-col lg:pl-[240px]">
        {showAlert ? <ApiAlertBanner hasPaymentMethod={setup.hasPaymentMethod} hasApiKey={setup.hasApiKey} /> : null}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-[960px]">{children}</div>
        </main>
      </div>
    </div>
  );
}