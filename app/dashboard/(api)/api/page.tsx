import Link from "next/link";
import { BookOpen, Bot, KeyRound, LineChart } from "lucide-react";
import { ApiDocsSnippet } from "@/components/api-dashboard/api-docs-snippet";
import { GetStartedCard } from "@/components/api-dashboard/get-started-card";
import { MetricCard } from "@/components/api-dashboard/metric-card";
import { MOCK_METRICS } from "@/lib/api-dashboard/mock-data";
import { getDisplayName, getTimeGreeting } from "@/lib/api-dashboard/greeting";
import { requireUser } from "@/lib/supabase/auth";
import { getAccessContext } from "@/lib/services/access/permissions";

export default async function ApiPlatformHomePage() {
  const { user } = await requireUser();
  const { subscription } = await getAccessContext(user.id);
  const greeting = getTimeGreeting();
  const name = getDisplayName(user.name, user.email);
  const creditsDisplay =
    subscription.credits_remaining > 0
      ? `${subscription.credits_remaining} credits`
      : MOCK_METRICS.availableCreditsUsd;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-[#f5f5f5] sm:text-[1.65rem]">
          {greeting}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8a8a8a]">
          Generate launch images, banners, social creatives, and product launch packs from one API.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Available credits" value={creditsDisplay} hint="Track generation usage and credits." />
        <MetricCard label="Total spent" value={MOCK_METRICS.totalSpentUsd} />
        <MetricCard label="Total issued" value={MOCK_METRICS.totalIssuedUsd} />
        <MetricCard
          label="Active API keys"
          value={String(MOCK_METRICS.activeApiKeys)}
          hint={MOCK_METRICS.activeApiKeys === 0 ? "0 active keys" : undefined}
        />
      </section>

      <section>
        <h2 className="text-sm font-medium text-[#f5f5f5]">Get started</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <GetStartedCard
            title="Create an API key"
            description="API keys authenticate requests to LaunchPix."
            href="/dashboard/api/keys"
            icon={<KeyRound className="size-4" />}
          />
          <GetStartedCard
            title="View docs"
            description="Launch-ready visuals through one API."
            href="/docs/api"
            icon={<BookOpen className="size-4" />}
          />
          <GetStartedCard
            title="Track usage"
            description="Monitor generation spend and credit consumption."
            href="/dashboard/api/usage"
            icon={<LineChart className="size-4" />}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-[#f5f5f5]">Build with agents</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="api-dashboard-card rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#111111] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0d0d0d]">
                <Bot className="size-4 text-[#a1a1a1]" />
              </span>
              <div>
                <p className="text-sm font-medium text-[#f5f5f5]">MCP server</p>
                <p className="mt-1.5 text-sm leading-6 text-[#8a8a8a]">
                  Connect LaunchPix to your preferred agent workflow for automated launch asset generation.
                </p>
                <Link
                  href="/docs/api"
                  className="mt-3 inline-block text-sm text-[#a1a1a1] underline-offset-2 hover:text-[#f5f5f5] hover:underline"
                >
                  Read integration guide
                </Link>
              </div>
            </div>
          </div>
          <ApiDocsSnippet />
        </div>
      </section>
    </div>
  );
}