import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint?: ReactNode;
}) {
  return (
    <div className="api-dashboard-card rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#111111] p-5 sm:p-6">
      <p className="text-xs font-medium text-[#8a8a8a]">{label}</p>
      <p className="mt-2 font-mono text-2xl font-light tracking-tight text-[#f5f5f5] sm:text-3xl">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-5 text-[#a1a1a1]">{hint}</p> : null}
    </div>
  );
}