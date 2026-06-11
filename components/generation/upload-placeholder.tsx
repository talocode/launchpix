import { UploadCloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function UploadPlaceholder() {
  return (
    <Card>
      <CardContent className="surface-muted flex min-h-64 flex-col items-center justify-center rounded-[4px] border border-dashed border-border/80 text-center">
        <UploadCloud className="size-9 text-foreground" />
        <p className="mt-5 text-lg font-semibold">Upload raw screenshots</p>
        <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
          PNG, JPG, or WEBP up to 10MB each. Deterministic templates are applied after upload so the final pack stays consistent.
        </p>
      </CardContent>
    </Card>
  );
}
