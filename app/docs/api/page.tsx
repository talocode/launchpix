import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Copy, FolderPlus, PlayCircle, UploadCloud } from "lucide-react";
import { TopNav } from "@/components/marketing/top-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";

const requestExamples = [
  {
    title: "Create a project",
    method: "POST",
    path: "/api/v1/projects",
    body: `{
  "name": "LaunchPix SDK launch",
  "productType": "web_app",
  "platform": "chrome_web_store",
  "description": "Turn raw screenshots into launch-ready visuals.",
  "audience": "Developer tools teams",
  "websiteUrl": "https://launchpix.example",
  "primaryColor": "#111111",
  "stylePreset": "minimal"
}`
  },
  {
    title: "Start generation",
    method: "POST",
    path: "/api/v1/projects/:projectId/generate",
    body: `{
  "x-launchpix-api-key": "lp_test_...",
  "x-launchpix-user-id": "user_uuid"
}`
  }
];

const uploadExample = `const form = new FormData();
form.append("file", screenshotFile);
form.append("position", "0");

const res = await fetch(
  \`\${baseUrl}/api/v1/projects/\${projectId}/uploads\`,
  {
    method: "POST",
    headers: {
      "x-launchpix-api-key": apiKey,
      "x-launchpix-user-id": userId
    },
    body: form
  }
);

const { upload } = await res.json();`;

const generateExample = `const res = await fetch(
  \`\${baseUrl}/api/v1/projects/\${projectId}/generate\`,
  {
    method: "POST",
    headers: {
      "x-launchpix-api-key": apiKey,
      "x-launchpix-user-id": userId
    }
  }
);

if (res.status !== 202) throw new Error(await res.text());

const { generationId, status, poll } = await res.json();`;

const sdkExample = `export async function createProject(baseUrl, apiKey, userId, project) {
  const res = await fetch(\`\${baseUrl}/api/v1/projects\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-launchpix-api-key": apiKey,
      "x-launchpix-user-id": userId
    },
    body: JSON.stringify(project)
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadScreenshot(baseUrl, apiKey, userId, projectId, file, position = 0) {
  const form = new FormData();
  form.append("file", file);
  form.append("position", String(position));

  const res = await fetch(\`\${baseUrl}/api/v1/projects/\${projectId}/uploads\`, {
    method: "POST",
    headers: {
      "x-launchpix-api-key": apiKey,
      "x-launchpix-user-id": userId
    },
    body: form
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generatePack(baseUrl, apiKey, userId, projectId) {
  const res = await fetch(\`\${baseUrl}/api/v1/projects/\${projectId}/generate\`, {
    method: "POST",
    headers: {
      "x-launchpix-api-key": apiKey,
      "x-launchpix-user-id": userId
    }
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}`;

const pollExample = `export async function waitForGeneration(baseUrl, apiKey, userId, projectId) {
  for (;;) {
    const res = await fetch(\`\${baseUrl}/api/v1/projects/\${projectId}/generate\`, {
      headers: {
        "x-launchpix-api-key": apiKey,
        "x-launchpix-user-id": userId
      }
    });
    const { generation } = await res.json();

    if (generation?.status === "completed") return generation;
    if (generation?.status === "failed") throw new Error(generation.error_message || "Generation failed.");

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}`;

const responseExample = `{
  "project": {
    "id": "project_uuid",
    "name": "LaunchPix SDK launch",
    "status": "ready"
  }
}`;

const onboardingSteps = [
  {
    icon: FolderPlus,
    title: "Create the workspace",
    text: "Send a project payload with the product name, platform, audience, and visual direction."
  },
  {
    icon: UploadCloud,
    title: "Attach screenshots",
    text: "Upload source screenshots through the dashboard or your own integration before generation."
  },
  {
    icon: PlayCircle,
    title: "Trigger generation",
    text: "Call the generation endpoint with your API key and owner UUID to start the launch pack render."
  },
  {
    icon: CheckCircle2,
    title: "Pull the result",
    text: "Fetch the latest generation, review the assets, and export the pack once it is ready."
  }
];

export default function ApiDocsPage() {
  return (
    <>
      <TopNav />
      <main className="app-shell py-14 sm:py-16">
        <section className="surface overflow-hidden p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="space-y-5">
              <p className="eyebrow">API first</p>
              <h1 className="hero-title max-w-3xl">LaunchPix Developer API</h1>
              <p className="section-copy max-w-3xl">
                LaunchPix is built for builders. Use `LAUNCHPIX_API_KEY` to create projects, trigger generation, and retrieve publish-ready launch packs from your own product workflow.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <Link href="/dashboard/api">
                    Open API dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">
                    Request access
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/pricing">View usage credits</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={"/docs/api/reference" as Route}>Open reference</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={"/docs/api/examples" as Route}>Open examples</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={"/docs/api/openapi.json" as Route}>Open JSON spec</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={"/docs/api/openapi.yaml" as Route}>Open YAML spec</Link>
                </Button>
              </div>

              <div className="grid gap-3 pt-2 sm:grid-cols-3">
                {[
                  ["Auth", "API key + owner UUID"],
                  ["Rate model", "Credit-based usage"],
                  ["Result", "Launch-ready asset packs"]
                ].map(([label, value]) => (
                  <div key={label} className="surface-muted p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-muted p-5 sm:p-6">
              <p className="dashboard-label">Quickstart</p>
              <div className="mt-5 grid gap-4">
                {onboardingSteps.map((item, index) => (
                  <div key={item.title} className="flex gap-4 rounded-[4px] border border-border/80 p-4">
                    <div className="grid size-10 shrink-0 place-items-center border border-border/80">
                      <item.icon className="size-4 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step {index + 1}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="surface p-6 sm:p-8">
            <p className="dashboard-label">Headers</p>
            <h2 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">Send these with each request</h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[4px] border border-border/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-sm text-foreground">x-launchpix-api-key</p>
                  <Copy className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Your service key. The same value can also be sent as `Authorization: Bearer &lt;key&gt;`.</p>
              </div>

              <div className="rounded-[4px] border border-border/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-sm text-foreground">x-launchpix-user-id</p>
                  <Copy className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">The UUID of the workspace owner. This scopes all API actions to the correct account.</p>
              </div>
            </div>

            <div className="mt-6 rounded-[4px] border border-border/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Response shape</p>
              <pre className="mt-3 overflow-x-auto text-sm leading-7 text-foreground">{responseExample}</pre>
            </div>
          </div>

          <div className="surface p-6 sm:p-8">
            <p className="dashboard-label">Endpoints</p>
            <h2 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">Create projects and trigger generations</h2>

            <div className="mt-6 space-y-4">
              {requestExamples.map((item) => (
                <div key={item.path} className="rounded-[4px] border border-border/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.method}</p>
                      <p className="mt-1 font-mono text-sm text-foreground">{item.path}</p>
                    </div>
                    <span className="rounded-[4px] border border-border/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Builder-ready
                    </span>
                  </div>
                  <pre className="mt-4 overflow-x-auto rounded-[4px] border border-border/80 bg-transparent p-4 text-xs leading-6 text-foreground">{item.body}</pre>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="surface p-6 sm:p-8">
            <p className="dashboard-label">Upload screenshots</p>
            <h2 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">Multipart upload example</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Use the API upload route for source images before you trigger generation. The route accepts a `file` field and a numeric `position` field.
            </p>
            <pre className="mt-5 overflow-x-auto rounded-[4px] border border-border/80 bg-transparent p-4 text-xs leading-6 text-foreground">{uploadExample}</pre>
          </div>

          <div className="surface p-6 sm:p-8">
            <p className="dashboard-label">Start generation</p>
            <h2 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">Kick off the launch pack render</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Once the project brief and screenshots are ready, call the generation endpoint. LaunchPix will return a generation ID and continue processing server-side.
            </p>
            <pre className="mt-5 overflow-x-auto rounded-[4px] border border-border/80 bg-transparent p-4 text-xs leading-6 text-foreground">{generateExample}</pre>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface p-6 sm:p-8">
            <p className="dashboard-label">Helper module</p>
            <h2 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">Copy this into your app</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              These helpers wrap the actual LaunchPix endpoints and keep the request contract in one place for teams building on top of the API.
            </p>
            <pre className="mt-5 overflow-x-auto rounded-[4px] border border-border/80 bg-transparent p-4 text-xs leading-6 text-foreground">{sdkExample}</pre>
          </div>

          <div className="surface p-6 sm:p-8">
            <p className="dashboard-label">Polling</p>
            <h2 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">Wait for the generation to finish</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              If your product wants to stay in sync with LaunchPix without the dashboard, poll the generation route until the asset pack is ready.
            </p>
            <pre className="mt-5 overflow-x-auto rounded-[4px] border border-border/80 bg-transparent p-4 text-xs leading-6 text-foreground">{pollExample}</pre>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "Built for internal tools",
              text: "Use LaunchPix from your own dashboard, CLI, or build pipeline instead of asking product teams to learn another consumer UI."
            },
            {
              title: "Usage credits",
              text: "Each account starts with 300 included credits. After that, top up with one-time credits only when your balance runs out."
            },
            {
              title: "Publish-ready output",
              text: "The API returns structured generation state, asset URLs, and export-ready packs so teams can move directly to launch."
            }
          ].map((item) => (
            <div key={item.title} className="surface-muted p-5">
              <p className="text-lg font-semibold text-foreground">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 surface p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="dashboard-label">Workflow</p>
              <h2 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">How a builder ships with LaunchPix</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                The intended flow is simple: create the project, upload screenshots, trigger generation, review the pack, and export the final assets.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                "1. Create a project with the API key and owner UUID.",
                "2. Upload screenshots as multipart form data.",
                "3. Trigger generation with the same credentials.",
                "4. Poll the generation or open the dashboard assets page.",
                "5. Export the final pack once the output is ready."
              ].map((item) => (
                <div key={item} className="rounded-[4px] border border-border/80 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
