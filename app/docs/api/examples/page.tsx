import type { Route } from "next";
import { MarketingPageShell } from "@/components/marketing/page-shell";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fullExample = `const baseUrl = "https://launchpix.example";
const apiKey = process.env.LAUNCHPIX_CUSTOMER_API_KEY; // lp_live_... from dashboard

async function createProject(project) {
  const res = await fetch(\`\${baseUrl}/api/v1/projects\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${apiKey}\`
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
      Authorization: \`Bearer \${apiKey}\`
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
      Authorization: \`Bearer \${apiKey}\`
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
        Authorization: \`Bearer \${apiKey}\`
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
  -H "Authorization: Bearer lp_live_..." \\
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
      title="Copy-paste LaunchPix API flows."
      description="These examples use per-customer API keys from the API dashboard. Each generation request reserves one credit."
    >
      <div className="space-y-6">
        <section className="surface p-6 sm:p-8">
          <p className="dashboard-label">Full workflow</p>
          <pre className="mt-4 overflow-x-auto text-sm leading-7 text-foreground">{fullExample}</pre>
        </section>

        <section className="surface p-6 sm:p-8">
          <p className="dashboard-label">Poll latest generation</p>
          <pre className="mt-4 overflow-x-auto text-sm leading-7 text-foreground">{pollExample}</pre>
        </section>

        <section className="surface p-6 sm:p-8">
          <p className="dashboard-label">curl</p>
          <pre className="mt-4 overflow-x-auto text-sm leading-7 text-foreground">{curlExample}</pre>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={"/docs/api" as Route}>Back to quickstart</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={"/dashboard/api/keys" as Route}>Create API keys</Link>
          </Button>
        </div>
      </div>
    </MarketingPageShell>
  );
}