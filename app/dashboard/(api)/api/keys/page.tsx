import { ApiKeysTable } from "@/components/api-dashboard/api-keys-table";
import { ApiPageHeader } from "@/components/api-dashboard/api-page-header";
import { CreateKeyButton } from "@/components/api-dashboard/create-key-button";
import { MOCK_API_KEYS } from "@/lib/api-dashboard/mock-data";

export default function ApiKeysPage() {
  return (
    <div>
      <ApiPageHeader
        title="API Keys"
        subtitle="API keys are used to authenticate requests to the LaunchPix API."
        action={<CreateKeyButton />}
      />
      <ApiKeysTable keys={MOCK_API_KEYS} />
    </div>
  );
}