"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type QualityIssue = { asset_type: string; code: string; message: string };
type Gen = {
  id: string;
  status: string;
  error_message?: string | null;
  style_json?: { quality_failures?: QualityIssue[]; quality_warnings?: QualityIssue[] } | null;
} | null;

const statusLabel: Record<string, string> = {
  queued: "Queued for processing",
  analyzing: "Reading product context",
  generating_copy: "Building asset messaging",
  rendering_assets: "Rendering launch visuals",
  completed: "Asset pack completed",
  failed: "Generation failed",
  idle: "Ready when you are"
};

function classifyGenerationError(message: string, projectId: string) {
  const lower = message.toLowerCase();

  if (lower.includes("no credits remaining") || lower.includes("credit")) {
    return {
      title: "Add credits to continue.",
      detail: "This workspace has no generation credits left. Buy credits, then rerun generation.",
      action: { label: "Buy credits", href: "/settings/billing" }
    };
  }

  if (lower.includes("upload") || lower.includes("screenshot")) {
    return {
      title: "Upload screenshots before generating.",
      detail: "LaunchPix needs at least one screenshot to build the pack.",
      action: { label: "Review project", href: `/dashboard/projects/${projectId}` }
    };
  }

  if (lower.includes("quality check")) {
    return {
      title: "Refine the brief and retry.",
      detail: "The generated copy or layout failed quality validation. Shorten copy, keep callouts concise, and try again.",
      action: { label: "Review project details", href: "/dashboard/projects" }
    };
  }

  if (lower.includes("sign in")) {
    return {
      title: "Session expired.",
      detail: "Sign in again and retry generation.",
      action: { label: "Sign in again", href: "/login" }
    };
  }

  return {
    title: "Generation needs another attempt.",
    detail: "LaunchPix could not complete the request. Retry after checking the project brief and upload set.",
    action: { label: "Review project", href: `/dashboard/projects/${projectId}` }
  };
}

export function GeneratePanel({ projectId, ready, missing, credits }: { projectId: string; ready: boolean; missing: string[]; credits: number }) {
  const router = useRouter();
  const [generation, setGeneration] = useState<Gen>(null);
  const [pending, startTransition] = useTransition();
  const [apiError, setApiError] = useState<string | null>(null);
  const [needsCredits, setNeedsCredits] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const currentStatus = generation?.status || "idle";
  const busy = ["queued", "analyzing", "generating_copy", "rendering_assets"].includes(currentStatus);
  const qualityFailures = generation?.style_json?.quality_failures || [];
  const qualityWarnings = generation?.style_json?.quality_warnings || [];

  function fixActionHref(code: string) {
    if (code.includes("screenshot")) return `/dashboard/projects/new?projectId=${projectId}&step=2`;
    return `/dashboard/projects/new?projectId=${projectId}&step=1`;
  }

  function fixActionLabel(code: string) {
    if (code.includes("screenshot")) return "Upload screenshots";
    if (code.includes("headline") || code.includes("subheadline") || code.includes("callout") || code.includes("cta")) return "Edit project brief";
    if (code.includes("contrast")) return "Adjust style/color";
    return "Review project details";
  }

  const groupedFailures = qualityFailures.reduce<Record<string, QualityIssue[]>>((acc, item) => {
    const key = `${item.asset_type}::${item.code}`;
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  const groupedWarnings = qualityWarnings.reduce<Record<string, QualityIssue[]>>((acc, item) => {
    const key = `${item.asset_type}::${item.code}`;
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  async function fetchState() {
    const res = await fetch(`/api/generations/${projectId}`);
    if (res.status === 401) {
      setSessionExpired(true);
      return;
    }
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
    setSessionExpired(false);
    setGeneration((current) => ({ id: current?.id || "pending", status: "queued", error_message: null }));
    const res = await fetch(`/api/generations/${projectId}`, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = typeof json.error === "string" ? json.error : "Generation could not start. Please retry.";
      setApiError(message);
      setGeneration((current) => (current?.id ? { ...current, status: "failed", error_message: message } : null));
      if (res.status === 401) setSessionExpired(true);
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
  const errorInfo = useMemo(() => {
    if (generation?.status !== "failed" && !apiError) return null;
    const message = generation?.error_message || apiError || "";
    return classifyGenerationError(message, projectId);
  }, [apiError, generation?.error_message, generation?.status, projectId]);

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
        <div className="inline-flex w-fit items-center gap-2 rounded-[4px] border border-border/80 bg-transparent px-3 py-2 text-xs font-medium text-muted-foreground">
          {busy ? <Clock3 className="size-4 animate-pulse text-muted-foreground" /> : ready ? <CheckCircle2 className="size-4 text-foreground" /> : <AlertCircle className="size-4 text-foreground" />}
          {statusLabel[currentStatus] || "Ready when you are"}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[4px] border border-border/80 bg-transparent p-4">
          {!ready ? (
            <div className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-[4px] border border-border/80 bg-transparent">
                <AlertCircle className="size-5 text-foreground" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {blockedByCredits ? "Add credits to generate this launch pack." : "Complete the missing setup before generating."}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Missing: {missingText}.</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-[4px] border border-border/80 bg-transparent">
                <Sparkles className="size-5 text-foreground" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Everything is ready for generation.</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Start the render and LaunchPix will redirect you to the asset view when the pack is complete.</p>
              </div>
            </div>
          )}

          <div className="mt-4 h-1 overflow-hidden rounded-none bg-muted">
            <div className="h-full rounded-none bg-foreground transition-all duration-500" style={{ width: progressWidth }} />
          </div>

          {errorInfo ? (
            <div className="rounded-[4px] border border-border/80 bg-transparent p-3">
              <p className="text-sm font-semibold text-foreground">{errorInfo.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{errorInfo.detail}</p>
              {errorInfo.action ? (
                <Link className="mt-2 inline-flex text-sm font-medium text-foreground underline underline-offset-4" href={errorInfo.action.href as never}>
                  {errorInfo.action.label}
                </Link>
              ) : null}
              {generation?.error_message || apiError ? (
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{generation?.error_message || apiError}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-[4px] border border-border/80 bg-transparent p-4">
          <p className="text-sm font-semibold text-foreground">Output checklist</p>
          <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
            {["5 app listing frames", "1 promo tile", "1 hero banner", "Quality checks before export"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-foreground" />
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
        {sessionExpired ? (
          <Button asChild variant="outline">
            <Link href="/login">Sign in again</Link>
          </Button>
        ) : null}
        {generation?.status === "failed" && qualityFailures.length > 0 ? (
          <div className="w-full rounded-[4px] border border-border/80 bg-transparent p-3 text-xs text-muted-foreground">
            <p className="font-semibold">Quality checks blocked export. Fix these and regenerate:</p>
            <div className="mt-2 space-y-2">
              {Object.entries(groupedFailures)
                .slice(0, 6)
                .map(([key, failures]) => {
                  const [assetType, code] = key.split("::");
                  const first = failures[0];
                  return (
                    <div key={key} className="rounded-[4px] border border-border/80 bg-transparent p-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground">{assetType.replaceAll("_", " ")}</p>
                        <span className="rounded-none border border-border/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{code}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{first.message}</p>
                      <a href={fixActionHref(code)} className="mt-1 inline-flex text-foreground underline underline-offset-4">
                        {fixActionLabel(code)}
                      </a>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : null}
        {generation?.status === "completed" && qualityWarnings.length > 0 ? (
          <div className="w-full rounded-[4px] border border-border/80 bg-transparent p-3 text-xs text-muted-foreground">
            <p className="font-semibold">Export ready, but quality warnings were detected:</p>
            <div className="mt-2 space-y-2">
              {Object.entries(groupedWarnings)
                .slice(0, 4)
                .map(([key, warnings]) => {
                  const [assetType, code] = key.split("::");
                  const first = warnings[0];
                  return (
                    <div key={key} className="rounded-[4px] border border-border/80 bg-transparent p-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground">{assetType.replaceAll("_", " ")}</p>
                        <span className="rounded-none border border-border/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{code}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{first.message}</p>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : null}
        {generation?.status === "failed" && !needsCredits && !sessionExpired && qualityFailures.length === 0 ? (
          <p className="text-xs text-muted-foreground sm:ml-1">If quality checks fail, shorten copy lines, keep callouts concise, and ensure screenshots are uploaded.</p>
        ) : null}
      </div>
    </section>
  );
}
