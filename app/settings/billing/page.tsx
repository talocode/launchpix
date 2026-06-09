import { BillingActions } from "@/components/dashboard/billing-actions";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/supabase/auth";
import { getAccessContext } from "@/lib/services/access/permissions";

export default async function BillingPage({
  searchParams
}: {
  searchParams?: Promise<{ checkout?: string }>;
}) {
  const { user } = await requireUser();
  const params = searchParams ? await searchParams.catch(() => ({} as { checkout?: string })) : {};

  try {
    const { subscription, plan } = await getAccessContext(user.id);
    const checkoutSucceeded = params.checkout === "success";

    return (
      <div className="space-y-6">
        {checkoutSucceeded ? (
          <section className="surface border border-border/80 bg-transparent p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Checkout received</p>
            <h2 className="mt-3 text-2xl font-semibold">We got your order callback.</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Lemon Squeezy will confirm the purchase through the webhook. Refresh this page after a moment to verify that your credits have been added.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <form action="/api/billing/verify" method="post">
                <button className="rounded-none border border-border/80 px-4 py-2 text-sm font-medium text-foreground" type="submit">
                  Verify billing state
                </button>
              </form>
            </div>
          </section>
        ) : null}

        <section className="surface overflow-hidden p-6 sm:p-8">
          <p className="eyebrow">Billing</p>
          <h1 className="section-title mt-4">Buy usage credits only when your launch balance runs out.</h1>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="surface-muted p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Access type</p>
              <p className="mt-3 text-2xl font-semibold">API usage</p>
            </div>
            <div className="surface-muted p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Credits remaining</p>
              <p className="mt-3 text-2xl font-semibold">{subscription.credits_remaining}</p>
            </div>
            <div className="surface-muted p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Billing status</p>
              <p className="mt-3 text-2xl font-semibold capitalize">{subscription.status}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            {subscription.last_payment_at
              ? `Last payment recorded on ${new Date(subscription.last_payment_at).toLocaleDateString()}.`
              : "No payment has been recorded yet for this workspace."}
          </p>
        </section>

        <Card>
          <CardContent className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold">Top up usage credits</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Every user starts with 300 credits. After those are used, buy a one-time credit top-up that matches your next launch workload.
              </p>
            </div>
            <BillingActions />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            Credits unlock the full Talocode LaunchPix API workflow: asset generation, full-resolution PNG downloads, ZIP exports, and commercial use. There is no monthly subscription to manage.
          </CardContent>
        </Card>
      </div>
    );
  } catch {
    return <Card><CardContent className="text-sm leading-7 text-muted-foreground">Billing details are temporarily unavailable. Please refresh or try again shortly.</CardContent></Card>;
  }
}
