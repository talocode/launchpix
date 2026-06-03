import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TopNav } from "@/components/marketing/top-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";

export default function ApiDocsPage() {
  return (
    <>
      <TopNav />
      <main className="app-shell py-14 sm:py-16">
        <section className="surface p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-start">
            <div>
              <p className="eyebrow">API first</p>
              <h1 className="mt-5 font-mono text-3xl font-light tracking-[-0.05em] sm:text-4xl">Talocode LaunchPix Developer API</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                Talocode LaunchPix is open source and API-first. Use `LAUNCHPIX_API_KEY` to call production endpoints and generate launch-ready asset packs from your own product workflow.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/dashboard/api">
                    Open API dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">
                    Request API key
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/pricing">View usage credits</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="surface-muted p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Auth headers</p>
                <p className="mt-3 font-mono text-sm text-foreground">x-launchpix-api-key</p>
                <p className="mt-1 text-sm text-muted-foreground">Pass your service key with each request.</p>
                <p className="mt-4 font-mono text-sm text-foreground">x-launchpix-user-id</p>
                <p className="mt-1 text-sm text-muted-foreground">Bind the request to the owner account.</p>
              </div>

              <div className="surface-muted p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Core endpoints</p>
                <p className="mt-3 font-mono text-sm text-foreground">GET /api/v1/projects</p>
                <p className="mt-1 text-sm text-muted-foreground">List your API-visible projects.</p>
                <p className="mt-4 font-mono text-sm text-foreground">POST /api/v1/projects</p>
                <p className="mt-1 text-sm text-muted-foreground">Create a project workspace from code.</p>
                <p className="mt-4 font-mono text-sm text-foreground">POST /api/v1/projects/:projectId/generate</p>
                <p className="mt-1 text-sm text-muted-foreground">Trigger a LaunchPix generation run.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "Built for developers",
              text: "Integrate LaunchPix into your own product, internal tools, or build pipeline instead of relying on a consumer SaaS interface."
            },
            {
              title: "Usage credits",
              text: "The first 300 credits are included. When they run out, top up with one-time usage credits from the billing page."
            },
            {
              title: "Production-ready output",
              text: "Each generation yields launch visuals designed for app stores, campaigns, and landing pages."
            }
          ].map((item) => (
            <div key={item.title} className="surface-muted p-5">
              <p className="text-lg font-semibold text-foreground">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
