import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="api-dashboard-card flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[rgba(255,255,255,0.12)] bg-[#111111] px-6 py-14 text-center">
      <p className="text-sm font-medium text-[#f5f5f5]">{title}</p>
      {description ? <p className="mt-2 max-w-sm text-sm leading-6 text-[#8a8a8a]">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}