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
          <p className="eyebrow">API first</p>
          <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Talocode LaunchPix Developer API</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
            Talocode LaunchPix is open source and API-first. To use production endpoints, request `LAUNCHPIX_API_KEY` and pass it with each request.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="surface-muted p-5">
              <p className="text-sm font-semibold">Auth headers</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">`x-launchpix-api-key: &lt;your-key&gt;`</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">`x-launchpix-user-id: &lt;owner-uuid&gt;`</p>
            </div>
            <div className="surface-muted p-5">
              <p className="text-sm font-semibold">Endpoints</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">`GET /api/v1/projects`</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">`POST /api/v1/projects`</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">`POST /api/v1/projects/:projectId/generate`</p>
            </div>
          </div>
          <div className="mt-8">
            <Button asChild>
              <Link href="/contact">
                Request API key
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
