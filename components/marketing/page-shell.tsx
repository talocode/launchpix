import type { ReactNode } from "react";
import { TopNav } from "@/components/marketing/top-nav";
import { MarketingFooter } from "@/components/marketing/footer";

export function MarketingPageShell({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <>
      <TopNav />
      <main>
        <section className="app-shell app-section">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.82fr] lg:items-end">
            <div className="space-y-5">
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="hero-title max-w-4xl text-balance">{title}</h1>
              <p className="section-copy max-w-2xl">{description}</p>
            </div>
            <div className="surface p-6 sm:p-7">
              <p className="dashboard-label">Why it matters</p>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <span>Pain</span>
                  <span className="font-medium text-foreground">Unpolished screenshots</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <span>Cost</span>
                  <span className="font-medium text-foreground">Slow handoff loops</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fix</span>
                  <span className="font-medium text-foreground">Launch-ready packs</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="app-shell pb-16 sm:pb-20">{children}</section>
      </main>
      <MarketingFooter />
    </>
  );
}
