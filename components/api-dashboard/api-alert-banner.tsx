import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function ApiAlertBanner({
  hasPaymentMethod,
  hasApiKey
}: {
  hasPaymentMethod: boolean;
  hasApiKey: boolean;
}) {
  const messages: string[] = [];
  if (!hasPaymentMethod) messages.push("Add a payment method to enable API billing and credit refills.");
  if (!hasApiKey) messages.push("Create an API key to authenticate LaunchPix API requests.");

  return (
    <div
      role="status"
      className="border-b border-[rgba(220,80,80,0.25)] bg-[#3b0d0d] px-4 py-3 text-sm text-[#e8a0a0] sm:px-6"
    >
      <div className="mx-auto flex max-w-[960px] flex-wrap items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#c96a6a]" aria-hidden />
        <div className="min-w-0 flex-1 space-y-1">
          {messages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {!hasApiKey ? (
            <Link
              href="/dashboard/api/keys"
              className="rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-3 py-1.5 text-xs font-medium text-[#f5f5f5] hover:bg-[rgba(255,255,255,0.1)]"
            >
              Create API key
            </Link>
          ) : null}
          {!hasPaymentMethod ? (
            <Link
              href="/dashboard/api/billing"
              className="rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-3 py-1.5 text-xs font-medium text-[#f5f5f5] hover:bg-[rgba(255,255,255,0.1)]"
            >
              Add payment method
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}