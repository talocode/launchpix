import { ApiPageHeader } from "@/components/api-dashboard/api-page-header";
import { BillingTabs } from "@/components/api-dashboard/billing-tabs";

export default function ApiBillingPage() {
  return (
    <div>
      <ApiPageHeader title="Billing" />
      <BillingTabs />
    </div>
  );
}