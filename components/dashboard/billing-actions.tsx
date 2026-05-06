"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKS, type CreditPackId } from "@/lib/services/billing/plans";

export function BillingActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{pack.description}</p>
          </div>
          <Button variant={pack.featured ? "default" : "outline"} disabled={loading !== null} onClick={() => checkout(pack.id)}>
            {loading === pack.id ? "Redirecting..." : `Buy ${pack.label}`}
          </Button>
        </div>
      ))}

      {error ? <p className="lg:col-span-3 text-sm text-rose-500">{error}</p> : <p className="lg:col-span-3 text-sm text-muted-foreground">Secure one-time checkout via Lemon Squeezy. Credits are added after payment confirmation.</p>}
    </div>
  );
}
