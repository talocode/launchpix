import type { Metadata } from "next";
import { Database, FileImage, LockKeyhole, Mail, Receipt, Sparkles } from "lucide-react";
import { MarketingPageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Privacy | LaunchPix",
  description: "How LaunchPix stores user data, processes screenshots, and handles billing and AI services."
};

const sections = [
  {
    icon: Database,
    title: "Account and workspace data",
    text: "We store your account email, project metadata, credit balance, billing status, and usage events needed to authenticate you, operate the dashboard, and keep your launch work organized."
  },
  {
    icon: FileImage,
    title: "Screenshots and generated assets",
    text: "Uploaded screenshots are stored so LaunchPix can render listing frames, promo tiles, and hero banners. Generated previews, full PNG files, and ZIP exports are stored in the configured Supabase storage buckets for your workspace."
  },
  {
    icon: Sparkles,
    title: "AI planning data",
    text: "LaunchPix uses Mistral for structured planning and, when configured, image generation: product context, screenshots, audience, style direction, copy structure, and asset prompts. If image generation is unavailable, LaunchPix falls back to its internal renderer."
  },
  {
    icon: Receipt,
    title: "Billing data",
    text: "Lemon Squeezy handles checkout and payment processing for credit packs. LaunchPix stores payment references, webhook fulfillment status, and credit updates, but does not store raw card details."
  },
  {
    icon: LockKeyhole,
    title: "Operational security",
    text: "Access to dashboard data is scoped to the signed-in account. Server-side operations use configured service credentials only where needed for storage, billing, and account workflows."
  },
  {
    icon: Mail,
    title: "Product emails",
    text: "LaunchPix may send operational emails about project creation, uploads, generation status, credit balance, billing events, asset downloads, and export activity."
  }
];

export default function PrivacyPage() {
  return (
    <MarketingPageShell
      eyebrow="Privacy"
      title="A clear view of the data LaunchPix stores and why."
      description="We keep the minimum account, project, asset, and billing context needed to run the product and support your launch workflow."
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
          <h2 className="text-2xl font-semibold text-foreground">Data requests and deletion</h2>
          <p className="mt-3">
            For privacy, access, correction, export, or deletion requests, contact <a href="mailto:support@launchpix.app" className="underline underline-offset-4">support@launchpix.app</a> from the email tied to your LaunchPix account. We may need to retain limited billing, fraud-prevention, or legal records where required.
          </p>
        </section>
      </div>
    </MarketingPageShell>
  );
}
