import { MarketingPageShell } from "@/components/marketing/page-shell";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fullExample = `const baseUrl = "https://launchpix.example";
const apiKey = process.env.LAUNCHPIX_API_KEY;
const userId = "user_uuid";

async function createProject(project) {
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

async function uploadScreenshot(projectId, file, position = 0) {
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

async function generatePack(projectId) {
  const res = await fetch(\`\${baseUrl}/api/v1/projects/\${projectId}/generate\`, {
    method: "POST",
    headers: {
      "x-launchpix-api-key": apiKey,
      "x-launchpix-user-id": userId
    }
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const { project } = await createProject({
  name: "LaunchPix SDK launch",
  productType: "web_app",
  platform: "chrome_web_store",
  description: "Turn raw screenshots into launch-ready visuals.",
  audience: "Developer tools teams",
  websiteUrl: "https://launchpix.example",
  primaryColor: "#111111",
  stylePreset: "minimal"
});

await uploadScreenshot(project.id, screenshotFile, 0);
await uploadScreenshot(project.id, screenshotFile2, 1);
const { generationId } = await generatePack(project.id);`;

const pollExample = `async function waitForGeneration(projectId) {
  for (;;) {
    const res = await fetch(\`\${baseUrl}/api/v1/projects/\${projectId}/generate\`, {
      headers: {
        "x-launchpix-api-key": apiKey,
        "x-launchpix-user-id": userId
      }
    });

    if (!res.ok) throw new Error(await res.text());
    const { generation } = await res.json();

    if (generation?.status === "completed") return generation;
    if (generation?.status === "failed") throw new Error(generation.error_message || "Generation failed.");

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}`;

const curlExample = `curl -X POST "${"https://launchpix.example"}/api/v1/projects" \\
  -H "Content-Type: application/json" \\
  -H "x-launchpix-api-key: lp_test_..." \\
  -H "x-launchpix-user-id: user_uuid" \\
  -d '{
    "name": "LaunchPix SDK launch",
    "productType": "web_app",
    "platform": "chrome_web_store",
    "description": "Turn raw screenshots into launch-ready visuals.",
    "audience": "Developer tools teams",
    "websiteUrl": "https://launchpix.example",
    "primaryColor": "#111111",
    "stylePreset": "minimal"
  }'`;

export default function ApiExamplesPage() {
  return (
    <MarketingPageShell
      eyebrow="API examples"
      title="Copy-paste LaunchPix into your app."
      description="This page shows the full create -> upload -> generate -> poll workflow using the actual LaunchPix API routes."
    >
      <div className="space-y-6">
        <section className="surface p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="dashboard-label">Reference formats</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Use the JSON or YAML spec if you want to generate clients, schemas, or API docs automatically.
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
          <p className="dashboard-label">End-to-end</p>
          <h2 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">JavaScript helper example</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Copy this into a server route or integration layer. It mirrors the actual API contract and keeps the request flow in one place.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-[4px] border border-border/80 bg-transparent p-4 text-xs leading-6 text-foreground">{fullExample}</pre>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface p-6 sm:p-8">
            <p className="dashboard-label">Polling</p>
            <h2 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">Wait for pack completion</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              The generation route can also be polled with `GET /api/v1/projects/:projectId/generate` until the pack reaches `completed`.
            </p>
            <pre className="mt-5 overflow-x-auto rounded-[4px] border border-border/80 bg-transparent p-4 text-xs leading-6 text-foreground">{pollExample}</pre>
          </div>

          <div className="surface p-6 sm:p-8">
            <p className="dashboard-label">cURL</p>
            <h2 className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">Project creation example</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Use cURL if you want to test the LaunchPix contract from terminal first, then move the same payload into your app.
            </p>
            <pre className="mt-5 overflow-x-auto rounded-[4px] border border-border/80 bg-transparent p-4 text-xs leading-6 text-foreground">{curlExample}</pre>
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <p className="dashboard-label">Flow</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            {[
              "1. Create a project with the API key and owner UUID.",
              "2. Upload screenshots with multipart form data.",
              "3. Trigger generation and get the generation ID.",
              "4. Poll the generation until the pack is ready."
            ].map((step) => (
              <div key={step} className="rounded-[4px] border border-border/80 p-4 text-sm leading-6 text-muted-foreground">
                {step}
              </div>
            ))}
          </div>
        </section>
      </div>
    </MarketingPageShell>
  );
}
