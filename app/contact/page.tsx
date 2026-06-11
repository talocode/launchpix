import type { Metadata } from "next";
import { CreditCard, FileWarning, LifeBuoy, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingPageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Contact | Talocode LaunchPix",
  description: "Contact Talocode LaunchPix support for product, API, billing, and account help."
};

const supportTypes = [
  {
    icon: Mail,
    title: "Primary support",
    text: "support@talocode.com"
  },
  {
    icon: CreditCard,
    title: "Credit or billing issue",
    text: "Include the account email, Lemon Squeezy checkout reference, credit top-up name, and the time of payment."
  },
  {
    icon: Sparkles,
    title: "Generation issue",
    text: "Share the project name, upload count, generation step, and exact error text shown in the dashboard."
  },
  {
    icon: FileWarning,
    title: "Export issue",
    text: "Tell us whether the problem happened on individual PNG download, ZIP export, or asset preview."
  },
  {
    icon: ShieldCheck,
    title: "Account or privacy request",
    text: "Send the request from the email tied to the account so we can verify ownership."
  },
  {
    icon: LifeBuoy,
    title: "Product feedback",
    text: "Share the workflow you expected, what blocked you, and what asset format would help your launch."
  }
];

export default function ContactPage() {
  return (
    <MarketingPageShell
      eyebrow="Support"
      title="Blocked by an export, credit, or generation issue? Send the context once."
      description="Launch work slows down when support asks vague follow-up questions. Tell us what broke, where it happened, and the email on the account so we can respond with concrete next steps."
    >
      <div className="space-y-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {supportTypes.map((item) => (
            <div key={item.title} className="surface-muted p-6">
              <item.icon className="size-5 text-foreground" />
              <p className="mt-3 font-semibold">{item.title}</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="surface-muted p-6 text-center sm:p-8">
          <h2 className="text-2xl font-semibold">The fastest support message is specific.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Send the page you were on, the action you took, and any error text you saw. For billing requests, include the payment reference and the email used at checkout.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="surface p-5">
              <p className="text-sm font-semibold">Helpful context</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">Project name, browser details, account email, and any screenshot of the issue.</p>
            </div>
            <div className="surface p-5">
              <p className="text-sm font-semibold">Best channel</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">Email is the fastest route for both account and billing support right now.</p>
            </div>
          </div>

          <Button asChild className="mt-6" size="lg">
            <a href="mailto:support@talocode.com">Email support</a>
          </Button>
        </div>
      </div>
    </MarketingPageShell>
  );
}
