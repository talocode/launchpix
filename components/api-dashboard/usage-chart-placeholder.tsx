const yLabels = ["$0.20", "$0.10", "$0"];
const xLabels = ["May 28", "May 29", "May 30", "May 31", "Jun 1", "Jun 2", "Jun 3"];

export function UsageChartPlaceholder() {
  return (
    <div className="api-dashboard-card rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#111111] p-5 sm:p-6">
      <div className="relative aspect-[16/7] min-h-[220px] w-full">
        <div className="absolute inset-0 grid grid-rows-3">
          {yLabels.map((label) => (
            <div key={label} className="relative border-t border-[rgba(255,255,255,0.06)]">
              <span className="absolute -left-1 -top-2.5 -translate-x-full pr-2 text-[10px] text-[#8a8a8a] sm:static sm:translate-x-0">
                {label}
              </span>
            </div>
          ))}
        </div>

        <svg viewBox="0 0 640 220" className="absolute inset-0 h-full w-full pl-10 sm:pl-12" preserveAspectRatio="none" aria-hidden>
          <polyline
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2"
            points="0,180 110,165 220,150 330,140 440,130 550,125 640,120"
          />
          <polyline
            fill="rgba(255,255,255,0.04)"
            stroke="none"
            points="0,220 0,180 110,165 220,150 330,140 440,130 550,125 640,120 640,220"
          />
        </svg>

        <div className="absolute inset-x-0 bottom-0 flex justify-between pl-10 pr-1 text-[10px] text-[#8a8a8a] sm:pl-12">
          {xLabels.map((label) => (
            <span key={label} className="hidden sm:inline">
              {label}
            </span>
          ))}
          <span className="sm:hidden">Last 7 days</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-[#8a8a8a]">Usage chart preview. Connect billing meters to populate live generation spend.</p>
    </div>
  );
}