import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { getAccessContext } from "@/lib/services/access/permissions";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = await requireUser();
  const { subscription, plan } = await getAccessContext(user.id);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground lg:flex-row">
      <DashboardSidebar credits={subscription.credits_remaining} planLabel={plan.label} userEmail={user.email ?? "user@talocode.com"} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <DashboardTopbar credits={subscription.credits_remaining} planLabel={plan.label} />
        <main className="flex-1 px-4 pb-8 pt-3 sm:px-5 lg:px-6">
          <div className="mx-auto w-full max-w-[1360px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
