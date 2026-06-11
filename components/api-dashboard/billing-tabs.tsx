"use client";

import { useState } from "react";
import { EmptyState } from "@/components/api-dashboard/empty-state";

const tabs = ["Billing Information", "Credits", "Invoices"] as const;

type TabId = (typeof tabs)[number];

export function BillingTabs() {
  const [active, setActive] = useState<TabId>("Billing Information");

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-[rgba(255,255,255,0.08)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={
              active === tab
                ? "border-b border-[#f5f5f5] px-4 py-2.5 text-sm font-medium text-[#f5f5f5]"
                : "px-4 py-2.5 text-sm text-[#8a8a8a] hover:text-[#a1a1a1]"
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {active === "Billing Information" ? (
          <div className="space-y-6">
            <p className="max-w-2xl text-sm leading-7 text-[#a1a1a1]">
              Add a payment method to start using the LaunchPix API. Your account begins with an initial refill after
              billing is configured.
            </p>
            <EmptyState
              title="Missing payment method"
              description="Billing integration is not connected for this workspace yet. Configure payment when your provider is enabled."
              action={
                <button
                  type="button"
                  disabled
                  className="rounded-lg bg-[#f5f5f5] px-4 py-2 text-sm font-medium text-[#050505] opacity-60"
                  title="Payment provider wiring is not enabled for this account"
                >
                  Add payment method
                </button>
              }
            />
          </div>
        ) : null}

        {active === "Credits" ? (
          <EmptyState
            title="No credit history"
            description="Track your generation usage and credits after billing is configured."
          />
        ) : null}

        {active === "Invoices" ? (
          <EmptyState title="No invoices yet" description="Invoices will appear here once billing is active." />
        ) : null}
      </div>
    </div>
  );
}