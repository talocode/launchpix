import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/page-shell";
import { Button } from "@/components/ui/button";

const routes = [
  {
    method: "GET",
    path: "/api/v1/projects",
    summary: "List API-visible projects for the current owner.",
    response: `{
  "projects": [
    {
      "id": "project_uuid",
      "name": "LaunchPix SDK launch",
      "product_type": "web_app",
      "platform": "chrome_web_store",
      "status": "ready"
    }
  ]
}`
  },
  {
    method: "POST",
    path: "/api/v1/projects",
    summary: "Create a project workspace from code.",
    response: `{
  "project": {
    "id": "project_uuid",
    "name": "LaunchPix SDK launch",
    "status": "ready"
  }
}`
  },
  {
    method: "POST",
    path: "/api/v1/projects/:projectId/uploads",
    summary: "Upload one screenshot as multipart form data.",
    response: `{
  "upload": {
    "id": "upload_uuid",
    "project_id": "project_uuid",
    "position": 0
  }
}`
  },
  {
    method: "GET",
    path: "/api/v1/projects/:projectId/generate",
    summary: "Fetch the latest generation record for the project.",
    response: `{
  "generation": {
    "id": "generation_uuid",
    "status": "rendering_assets"
  }
}`
  },
  {
    method: "POST",
    path: "/api/v1/projects/:projectId/generate",
    summary: "Start a generation run for the latest uploaded screenshots.",
    response: `{
  "generationId": "generation_uuid"
}`
  }
];

const errorCodes = [
  ["401", "Missing or invalid API key."],
  ["400", "Missing user UUID, invalid payload, or no screenshots uploaded."],
  ["404", "Project not found for the current owner."],
  ["429", "Too many generation attempts. Wait and retry."]
];

export default function ApiReferencePage() {
  return (
    <MarketingPageShell
      eyebrow="API reference"
      title="LaunchPix route reference for builders."
      description="Use this page when you want the exact route contract, payload shape, and response shape without scanning the full quickstart."
    >
      <div className="space-y-6">
        <section className="surface p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="dashboard-label">Machine-readable spec</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Pull the OpenAPI-style JSON directly into your tooling or SDK generator.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/docs/api/openapi.json">Open JSON spec</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs/api/openapi.yaml">Open YAML spec</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <p className="dashboard-label">Headers</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[4px] border border-border/80 p-4">
              <p className="font-mono text-sm text-foreground">x-launchpix-api-key</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Service key required for every API request.</p>
            </div>
            <div className="rounded-[4px] border border-border/80 p-4">
              <p className="font-mono text-sm text-foreground">x-launchpix-user-id</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Owner UUID that scopes the request to the correct workspace.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {routes.map((route) => (
            <div key={route.path} className="surface p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{route.method}</p>
                  <p className="mt-1 font-mono text-sm text-foreground">{route.path}</p>
                </div>
                <span className="rounded-[4px] border border-border/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Route
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{route.summary}</p>
              <pre className="mt-5 overflow-x-auto rounded-[4px] border border-border/80 bg-transparent p-4 text-xs leading-6 text-foreground">{route.response}</pre>
            </div>
          ))}
        </section>

        <section className="surface p-6 sm:p-8">
          <p className="dashboard-label">Error codes</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {errorCodes.map(([code, text]) => (
              <div key={code} className="rounded-[4px] border border-border/80 p-4">
                <p className="font-mono text-sm text-foreground">{code}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <p className="dashboard-label">Notes</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {[
              "Generation is credit-gated and requires at least one uploaded screenshot.",
              "Uploads use multipart form data with a file field and numeric position.",
              "Project creation and generation are both scoped to the same owner UUID."
            ].map((item) => (
              <div key={item} className="rounded-[4px] border border-border/80 p-4 text-sm leading-7 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </MarketingPageShell>
  );
}
