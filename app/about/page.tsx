import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard, FileImage, Layers3, Sparkles, UploadCloud, Wand2, Zap } from "lucide-react";
import { MarketingPageShell } from "@/components/marketing/page-shell";
import { Button } from "@/components/ui/button";
import { FREE_SIGNUP_CREDITS } from "@/lib/services/billing/plans";

export const metadata: Metadata = {
  title: "About | Talocode LaunchPix",
  description: "Learn how Talocode LaunchPix works as an API-first launch asset service for developers and product teams.",
  openGraph: {
    title: "About Talocode LaunchPix",
    description: "Talocode LaunchPix turns raw screenshots into launch-ready app listing visuals, promo tiles, hero banners, and export packs.",
    url: "https://launchpix.talocode.com/about"
  },
  twitter: {
    card: "summary_large_image",
    title: "About Talocode LaunchPix",
    description: "A detailed overview of Talocode LaunchPix, the API workflow, usage credits, exports, and launch asset generation."
  }
};

const problems = [
  "Raw screenshots rarely explain a product quickly enough for launch traffic.",
  "Founders lose time resizing, captioning, cropping, and re-exporting visuals for every channel.",
  "A product can be ready to ship while the launch assets still feel unfinished or inconsistent."
];

const workflow = [
  {
    icon: UploadCloud,
    title: "Create a launch project",
    text: "Describe the product, audience, platform, positioning, visual style, and goal for the asset pack."
  },
  {
    icon: FileImage,
    title: "Upload screenshots",
    text: "Add the source screenshots LaunchPix should turn into listing frames, promo tiles, and hero banners."
  },
  {
    icon: Wand2,
    title: "Generate the asset plan",
    text: "Mistral helps structure the copy and layout direction, then LaunchPix generates polished image assets with an internal renderer as a fallback."
  },
  {
    icon: Layers3,
    title: "Review and export",
    text: "Inspect the generated visuals, download individual PNG files, or export the full ZIP pack for launch handoff."
  }
];

const outputs = [
  "App listing screenshots that frame product value clearly",
  "Promo tiles for announcements, launch posts, and social campaigns",
  "Hero banners for landing pages, changelogs, and release pages",
  "ZIP export with organized production-ready files",
  "Editable copy and rerender controls for faster iteration"
];

const audiences = [
  "Solo founders preparing a first launch",
  "Product teams shipping product updates often",
  "App and extension builders refreshing store listings",
  "Agencies producing launch visuals for multiple clients",
  "Growth teams testing new campaign creative"
];

export default function AboutPage() {
  return (
    <MarketingPageShell
      eyebrow="About Talocode LaunchPix"
      title="Talocode LaunchPix turns unfinished screenshots into launch-ready visual packs."
      description="Talocode LaunchPix is a focused API-first service for founders, product teams, and agencies that need polished product visuals without rebuilding every screenshot layout manually."
    >
      <div className="space-y-12">
        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-muted p-6 sm:p-8">
            <p className="eyebrow">The problem</p>
            <h2 className="mt-4 font-mono text-3xl font-light tracking-[-0.05em] text-foreground">Great products can still look unready at launch.</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Launch week creates a practical design gap: the product exists, but the screenshots still need framing, hierarchy, captions, sizing, and a consistent visual system.
            </p>
          </div>

          <div className="grid gap-3">
            {problems.map((item) => (
              <div key={item} className="surface-muted flex items-start gap-3 p-5">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-foreground" />
                <p className="text-sm leading-7 text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">What it does</p>
            <h2 className="section-title mt-4">One guided workflow from brief to export.</h2>
            <p className="section-copy mx-auto mt-4">
              LaunchPix combines a project brief, uploaded screenshots, structured AI planning, image generation, and fallback rendering to produce reusable launch visuals that feel connected across channels.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map((item) => (
              <div key={item.title} className="surface-muted p-5">
                <div className="flex size-11 items-center justify-center rounded-[4px] border border-border/80 bg-transparent">
                  <item.icon className="size-5 text-foreground" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="surface-muted p-6 sm:p-8">
            <p className="eyebrow">What you get</p>
            <h2 className="mt-4 font-mono text-3xl font-light tracking-[-0.05em] text-foreground">A complete launch pack, not a loose image export.</h2>
            <div className="mt-6 space-y-4">
              {outputs.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-7 text-muted-foreground">
                  <Sparkles className="mt-1 size-4 shrink-0 text-foreground" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-muted p-6 sm:p-8">
            <p className="eyebrow">Who it is for</p>
            <h2 className="mt-4 font-mono text-3xl font-light tracking-[-0.05em] text-foreground">Built for people shipping product, not managing design files.</h2>
            <div className="mt-6 space-y-4">
              {audiences.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-7 text-muted-foreground">
                  <Zap className="mt-1 size-4 shrink-0 text-foreground" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface overflow-hidden p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="eyebrow">Credits and billing</p>
              <h2 className="section-title mt-4">Talocode LaunchPix uses usage credits, not subscriptions.</h2>
              <p className="section-copy mt-4">
                Every account starts with {FREE_SIGNUP_CREDITS} credits. A generation run consumes one credit. When the balance runs out, users buy one-time credit top-ups through Lemon Squeezy and continue generating.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Included", `${FREE_SIGNUP_CREDITS}`, "credits at signup"],
                ["Model", "One-time", "credit top-ups"],
                ["Provider", "Lemon", "Squeezy checkout"]
              ].map(([label, value, detail]) => (
                <div key={label} className="surface-muted p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                  <p className="mt-3 font-mono text-2xl font-light tracking-[-0.04em] text-foreground">{value}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-muted p-6 text-center sm:p-8">
          <CreditCard className="mx-auto size-6 text-foreground" />
          <h2 className="mx-auto mt-5 max-w-2xl font-mono text-3xl font-light tracking-[-0.05em] text-foreground">
            The goal is simple: help products look ready when the launch traffic arrives.
          </h2>
          <p className="section-copy mx-auto mt-4 max-w-2xl">
            Talocode LaunchPix removes repetitive visual production from the launch process so teams can focus on positioning, shipping, and learning from the market.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard/projects/new">
                Create a launch project
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View credits</Link>
            </Button>
          </div>
        </section>
      </div>
    </MarketingPageShell>
  );
}
