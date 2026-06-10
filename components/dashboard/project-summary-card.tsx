export function ProjectSummaryCard({
  name,
  productType,
  platform,
  audience,
  style,
  screenshotCount
}: {
  name: string;
  productType: string;
  platform: string;
  audience: string;
  style: string;
  screenshotCount: number;
}) {
  const rows = [
    { label: "Project", value: name || "Untitled" },
    { label: "Type", value: productType || "-" },
    { label: "Platform", value: platform || "-" },
    { label: "Audience", value: audience || "-" },
    { label: "Style", value: style || "-" },
    { label: "Screenshots", value: `${screenshotCount}/5` }
  ];

  return (
    <aside className="dashboard-card sticky top-28 space-y-5 p-5 sm:p-6">
      <div>
        <p className="dashboard-label">Snapshot</p>
        <h3 className="mt-3 font-mono text-lg font-light tracking-[-0.04em] text-foreground">Project summary</h3>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 border-b border-border/80 pb-3 text-sm last:border-b-0 last:pb-0">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="max-w-[60%] text-right font-medium text-foreground">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-card-muted p-4 text-sm leading-7 text-muted-foreground">
        Expected output: five listing visuals, one promo tile, and one hero banner with a cohesive launch narrative.
      </div>
    </aside>
  );
}
