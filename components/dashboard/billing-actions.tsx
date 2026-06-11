"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKS, type CreditPackId } from "@/lib/services/billing/plans";

export function BillingActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function describeCheckoutError(message: string) {
    const lower = message.toLowerCase();

    if (lower.includes("session expired")) {
      return "Sign in again, then reopen billing to continue.";
    }

    if (lower.includes("configured") || lower.includes("store id") || lower.includes("variant")) {
      return "Check the Lemon Squeezy store and variant environment variables in Netlify.";
    }

    if (lower.includes("verified email")) {
      return "Use a Google account with a verified email address, then retry checkout.";
    }

    return "If it repeats, verify the Lemon Squeezy store ID, variant IDs, and webhook settings.";
  }

  async function checkout(packId: CreditPackId) {
    setError(null);
    setLoading(packId);

    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId })
    });

    let json: Record<string, unknown> = {};
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    }

    if (res.status === 401) {
      setError("Session expired. Please sign in again to continue checkout.");
      setLoading(null);
      return;
    }

    if (!res.ok) {
      const errorMessage = typeof json.error === "string" ? json.error : "Checkout could not start. Please try again.";
      setError(errorMessage);
      setLoading(null);
      return;
    }

    const checkoutUrl =
      typeof json.checkout_url === "string"
        ? json.checkout_url
        : typeof json.authorization_url === "string"
          ? json.authorization_url
          : null;

    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }

    setError("Checkout response was incomplete. Please retry.");
    setLoading(null);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {CREDIT_PACKS.map((pack) => (
        <div key={pack.id} className="surface-muted flex flex-col gap-4 p-5">
          <div>
            <p className="text-base font-semibold">{pack.label}</p>
            <p className="mt-2 text-3xl font-semibold">{pack.creditsGranted.toLocaleString()} credits</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {pack.priceLabel} &middot; {pack.description}
            </p>
          </div>
          <Button variant={pack.featured ? "default" : "outline"} disabled={loading !== null} onClick={() => checkout(pack.id)}>
            {loading === pack.id ? "Redirecting..." : `Top up ${pack.label}`}
          </Button>
        </div>
      ))}

      {error ? (
        <div className="lg:col-span-3 rounded-[4px] border border-border/80 bg-transparent p-4 text-sm text-foreground">
          <p>{error}</p>
          <p className="mt-2 text-muted-foreground">{describeCheckoutError(error)}</p>
        </div>
      ) : (
        <p className="lg:col-span-3 text-sm text-muted-foreground">Secure one-time checkout via Lemon Squeezy. Credits are added after payment confirmation.</p>
      )}
    </div>
  );
}
