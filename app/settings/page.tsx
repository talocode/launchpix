import Link from "next/link";
import { ArrowRight, CreditCard, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/supabase/auth";
import { getAccessContext } from "@/lib/services/access/permissions";

export default async function SettingsPage() {
  const { user } = await requireUser();
  const { subscription, plan } = await getAccessContext(user.id);

  return (
    <div className="space-y-6">
      <section className="surface overflow-hidden p-6 sm:p-8">
        <p className="eyebrow">Settings</p>
        <h1 className="section-title mt-4">Manage your account, credits, and launch workflow defaults.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Review the email tied to your workspace, confirm your current credit balance, and jump into billing whenever you need more generation capacity.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="rounded-[4px] border border-border/80 bg-transparent p-3">
                <Mail className="size-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workspace email</p>
                <p className="mt-2 font-mono text-xl font-light tracking-[-0.04em] text-foreground">{user.email}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">This address receives account-related updates.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="surface-muted p-5">
                <ShieldCheck className="size-5 text-foreground" />
                <p className="mt-4 font-semibold">Credit balance</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {plan.label} - {subscription.credits_remaining} credits remaining
                </p>
              </div>
              <div className="surface-muted p-5">
                <Sparkles className="size-5 text-foreground" />
                <p className="mt-4 font-semibold">Export mode</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {plan.fullResolutionExport ? "Full-resolution export is active while credits remain." : "Export is limited until credits are available."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Quick actions</p>
              <h2 className="mt-3 text-2xl font-semibold">What do you want to adjust?</h2>
            </div>

            <div className="space-y-3">
              <Link href="/settings/billing" className="surface-muted flex items-center justify-between gap-4 p-4 text-sm font-medium text-foreground transition-opacity hover:opacity-80">
                <span className="flex items-center gap-3"><CreditCard className="size-4" /> Billing and credits</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/dashboard/projects" className="surface-muted flex items-center justify-between gap-4 p-4 text-sm font-medium text-foreground transition-opacity hover:opacity-80">
                <span className="flex items-center gap-3"><Sparkles className="size-4" /> View projects</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <Button asChild className="w-full" variant="outline">
              <Link href="/settings/billing">Manage billing</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
