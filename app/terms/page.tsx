import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, CreditCard, Download, Scale, ShieldCheck } from "lucide-react";
import { MarketingPageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Terms | LaunchPix",
  description: "LaunchPix terms covering usage limits, billing, credits, export access, and service constraints."
};

const sections = [
  {
    icon: ShieldCheck,
    title: "Acceptable use",
    text: "Use LaunchPix only for lawful product marketing workflows. You are responsible for the rights to any screenshots, brand assets, product copy, customer content, and other material you upload."
  },
  {
    icon: CreditCard,
    title: "Credits and purchases",
    text: "Each generation run consumes one credit. Every account starts with included credits, and you can buy one-time credit packs through Lemon Squeezy when the balance runs out. Credit packs are not recurring subscriptions."
  },
  {
    icon: Download,
    title: "Exports and commercial use",
    text: "Generated assets may be used for your product marketing, store listings, launch pages, and campaigns, provided you have the rights to the uploaded source materials and comply with applicable laws."
  },
  {
    icon: CheckCircle2,
    title: "Generated output",
    text: "LaunchPix uses structured AI planning, Mistral image generation when configured, and internal fallback templates. You are responsible for reviewing generated copy, visuals, claims, and layout before publishing them publicly."
  },
  {
    icon: AlertTriangle,
    title: "Service availability",
    text: "LaunchPix is offered on an as-available basis during the MVP stage. Generation, exports, billing confirmation, storage, or third-party services may occasionally be delayed or unavailable."
  },
  {
    icon: Scale,
    title: "No prohibited content",
    text: "Do not upload unlawful, infringing, deceptive, abusive, or malicious content. We may restrict access if a workspace is used in a way that risks the product, users, payment providers, or infrastructure."
  }
];

export default function TermsPage() {
  return (
    <MarketingPageShell
      eyebrow="Terms"
      title="The operating terms for using LaunchPix."
      description="These terms cover acceptable use, credit consumption, export access, and the current MVP service posture for LaunchPix."
    >
      <div className="space-y-8 legal-copy">
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((item) => (
            <section key={item.title} className="surface-muted p-6">
              <item.icon className="size-5 text-cyan-300" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">{item.title}</h2>
              <p className="mt-3">{item.text}</p>
            </section>
          ))}
        </div>

        <section className="surface-muted p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Billing support and disputes</h2>
          <p className="mt-3">
            If a payment succeeds but credits are not added, contact <a href="mailto:support@launchpix.app" className="underline underline-offset-4">support@launchpix.app</a> with the account email and checkout reference. Webhook fulfillment usually completes automatically, but support can reconcile confirmed purchases.
          </p>
        </section>
      </div>
    </MarketingPageShell>
  );
}
