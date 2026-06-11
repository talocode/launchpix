import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  draft: "border-border/80 bg-transparent text-muted-foreground",
  ready: "border-border/80 bg-transparent text-foreground",
  queued: "border-border/80 bg-transparent text-muted-foreground",
  analyzing: "border-border/80 bg-transparent text-foreground",
  generating_copy: "border-border/80 bg-transparent text-foreground",
  rendering_assets: "border-border/80 bg-transparent text-foreground",
  generating: "border-border/80 bg-transparent text-foreground",
  completed: "border-border/80 bg-transparent text-foreground",
  failed: "border-border/80 bg-transparent text-foreground"
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={cn("capitalize tracking-[0.14em]", colorMap[status] || colorMap.draft)}>{status.replaceAll("_", " ")}</Badge>;
}
