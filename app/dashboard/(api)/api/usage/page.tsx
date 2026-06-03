import { ApiPageHeader } from "@/components/api-dashboard/api-page-header";
import { UsageChartPlaceholder } from "@/components/api-dashboard/usage-chart-placeholder";

export default function ApiUsagePage() {
  return (
    <div>
      <ApiPageHeader
        title="Usage"
        subtitle="View and track your API usage over time."
      />
      <UsageChartPlaceholder />
    </div>
  );
}