"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Gen = { id: string; status: string; error_message?: string | null } | null;

const statusLabel: Record<string, string> = {
  queued: "Queued for processing",
  analyzing: "Reading product context",
  generating_copy: "Building asset messaging",
  rendering_assets: "Rendering launch visuals",
  completed: "Asset pack completed",
  failed: "Generation failed",
  idle: "Ready when you are"
};

export function GeneratePanel({ projectId, ready, missing, credits }: { projectId: string; ready: boolean; missing: string[]; credits: number }) {
  const router = useRouter();
  const [generation, setGeneration] = useState<Gen>(null);
  const [pending, startTransition] = useTransition();
  const [apiError, setApiError] = useState<string | null>(null);
  const [needsCredits, setNeedsCredits] = useState(false);

  const currentStatus = generation?.status || "idle";
  const busy = ["queued", "analyzing", "generating_copy", "rendering_assets"].includes(currentStatus);

  async function fetchState() {
    const res = await fetch(`/api/generations/${projectId}`);
    if (!res.ok) return;
    const json = await res.json();
    setGeneration(json.generation);
  }

  useEffect(() => {
    void fetchState();
    const intervalId = setInterval(fetchState, 3500);
    return () => clearInterval(intervalId);
  }, [projectId]);

  useEffect(() => {
    if (generation?.status === "completed") {
      router.push(`/dashboard/projects/${projectId}/assets`);
    }
  }, [generation?.status, projectId, router]);

  async function generate() {
    setApiError(null);
    setNeedsCredits(false);
    setGeneration((current) => ({ id: current?.id || "pending", status: "queued", error_message: null }));
    const res = await fetch(`/api/generations/${projectId}`, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = typeof json.error === "string" ? json.error : "Generation could not start. Please retry.";
      setApiError(message);
      setGeneration((current) => (current?.id ? { ...current, status: "failed", error_message: message } : null));
      if (res.status === 402 || message.toLowerCase().includes("no credits remaining")) {
        setNeedsCredits(true);
      }
      return;
    }
    await fetchState();
  }

  const missingText = useMemo(() => missing.join(", "), [missing]);
  const blockedByCredits = credits <= 0;
  const progressWidth = busy ? "67%" : generation?.status === "completed" ? "100%" : ready ? "32%" : "18%";

  return (
    <section className="surface space-y-5 p-5 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="dashboard-label">Launch pack progress</p>
          <h2 className="mt-2 text-2xl font-semibold">Generate seven export-ready visuals.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Five listing frames, one promo tile, and one hero banner generated from your screenshots and structured copy plan.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300">
          {busy ? <Clock3 className="size-4 animate-pulse text-slate-300" /> : ready ? <CheckCircle2 className="size-4 text-emerald-300" /> : <AlertCircle className="size-4 text-amber-300" />}
          {statusLabel[currentStatus] || "Ready when you are"}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/[0.08] bg-[#050810] p-4">
          {!ready ? (
            <div className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-amber-300/10">
                <AlertCircle className="size-5 text-amber-300" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  {blockedByCredits ? "Add credits to generate this launch pack." : "Complete the missing setup before generating."}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-400">Missing: {missingText}.</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-emerald-300/10">
                <Sparkles className="size-5 text-emerald-300" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Everything is ready for generation.</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">Start the render and LaunchPix will redirect you to the asset view when the pack is complete.</p>
              </div>
            </div>
          )}

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#0b111c]">
            <div className="h-full rounded-full bg-slate-300 transition-all duration-500" style={{ width: progressWidth }} />
          </div>

          {generation?.status === "failed" ? <p className="text-sm text-rose-500">{generation.error_message || "Generation failed. Please retry."}</p> : null}
          {apiError ? <p className="text-sm text-rose-500">{apiError}</p> : null}
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#050810] p-4">
          <p className="text-sm font-semibold text-white">Output checklist</p>
          <div className="mt-3 grid gap-2 text-xs text-slate-400">
            {["5 app listing frames", "1 promo tile", "1 hero banner", "ZIP export package"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-slate-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button disabled={!ready || pending || busy} onClick={() => startTransition(() => void generate())} title={!ready ? `Missing: ${missingText}` : undefined}>
          {generation?.status === "failed" ? "Retry generation" : "Generate assets"}
        </Button>
        <Button asChild variant="outline">
          <Link href={`/dashboard/projects/${projectId}`}>Back to project</Link>
        </Button>
        {!ready ? (
          <p className="text-xs text-slate-500 sm:ml-1">
            {blockedByCredits ? "Generation is disabled until credits are available." : "Generation is disabled until the missing setup is complete."}
          </p>
        ) : null}
        {needsCredits ? (
          <Button asChild variant="outline">
            <Link href="/settings/billing">Buy credits</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
