import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingPageShell } from "@/components/marketing/page-shell";
import { CREDIT_PACKS, FREE_SIGNUP_CREDITS } from "@/lib/services/billing/plans";

const includedCredits = {
  id: "included",
  name: "Included credits",
  price: "NGN 0",
  desc: "Every new account gets enough credits to build real launch assets before paying.",
  tag: "Free grant",
  features: [`${FREE_SIGNUP_CREDITS} credits on signup`, "Full-resolution PNG exports", "ZIP downloads included"]
};

export const metadata: Metadata = {
  title: "Credits | Talocode LaunchPix",
  description: "Talocode LaunchPix uses one-time usage credits instead of subscriptions. Start with included credits, then top up when needed.",
  openGraph: {
    title: "Talocode LaunchPix Credits",
    description: "Start with included credits, then buy one-time credit top-ups when needed.",
    url: "https://launchpix.talocode.com/pricing"
  },
  twitter: {
    card: "summary_large_image",
    title: "Talocode LaunchPix Credits",
    description: "Simple usage credits for launch asset generation."
  }
};

export default function PricingPage() {
  return (
    <MarketingPageShell
      eyebrow="Pricing"
      title="Start with 300 credits. Top up only when you need more."
      description="Talocode LaunchPix is API usage based: no monthly subscription, no plan lock-in, and no paid top-up prompt until your included credits are exhausted."
    >
      <div className="grid gap-5 xl:grid-cols-4">
        <Card>
          <CardContent className="flex h-full flex-col gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{includedCredits.tag}</p>
              <h2 className="mt-3 text-2xl font-semibold">{includedCredits.name}</h2>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{includedCredits.price}</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{includedCredits.desc}</p>
            </div>

            <div className="space-y-3 text-sm">
              {includedCredits.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 text-slate-900 dark:text-white" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button asChild className="mt-auto w-full">
              <Link href="/dashboard/projects/new">
                Start with included credits
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {CREDIT_PACKS.map((pack) => (
          <Card key={pack.id} className={pack.featured ? "border-border/80 shadow-none" : undefined}>
            <CardContent className="flex h-full flex-col gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{pack.featured ? "Most used" : "Top up"}</p>
                <h2 className="mt-3 text-2xl font-semibold">{pack.label}</h2>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{pack.creditsGranted.toLocaleString()} credits</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {pack.priceLabel} - {pack.description}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                {["One-time purchase", "Full-resolution PNG + ZIP", "Commercial use included"].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 text-slate-900 dark:text-white" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button asChild className="mt-auto w-full" variant={pack.featured ? "default" : "outline"}>
                <Link href="/settings/billing">
                  Buy credits
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "How credits work",
            text: "One generation run uses one credit, so your spend follows actual API usage instead of seats or recurring plans."
          },
          {
            title: "Developer friendly",
            text: "Build against the LaunchPix API with `LAUNCHPIX_API_KEY` and keep your own product workflow in control."
          },
          {
            title: "Export readiness",
            text: "Credit balance unlocks production PNG files and ZIP downloads for store uploads, campaigns, and team handoff."
          }
        ].map((item) => (
          <div key={item.title} className="surface-muted p-5">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="surface-muted mt-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Launch faster</p>
          <h3 className="mt-3 text-2xl font-semibold">Stop paying monthly for work you only need around launches.</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Use your included credits, ship the pack, and top up only when the next release needs more generation runs.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/projects/new">
            Create your first project
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </MarketingPageShell>
  );
}
