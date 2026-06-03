"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ImagePlus, Palette, Sparkles, UploadCloud } from "lucide-react";
import type { ProjectRecord, UploadRecord } from "@/types/project";
import { PRODUCT_TYPE_OPTIONS, PLATFORM_OPTIONS, STYLE_PRESET_OPTIONS } from "@/lib/validation/project";
import { MultiStepShell } from "@/components/dashboard/multi-step-shell";
import { ProjectSummaryCard } from "@/components/dashboard/project-summary-card";
import { ScreenshotList } from "@/components/dashboard/screenshot-list";
import { UploadPlaceholder } from "@/components/generation/upload-placeholder";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveStyleDirection, upsertProjectIdentity } from "@/lib/actions/projects";

const labels: Record<string, string> = {
  browser_extension: "Browser Extension",
  saas: "Web App",
  web_app: "Web App",
  mobile_app: "Mobile App",
  other: "Other",
  chrome_web_store: "Chrome Web Store",
  firefox_addons: "Firefox Add-ons",
  product_launch: "Product Launch",
  saas_marketing: "Product Marketing",
  general_promo: "General Promo",
  minimal: "Minimal",
  bold: "Bold",
  dark: "Dark",
  gradient: "Gradient",
  corporate: "Corporate"
};

export function NewProjectWizard({ initialStep, project, initialUploads }: { initialStep: number; project: ProjectRecord | null; initialUploads: UploadRecord[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [uploads, setUploads] = useState(initialUploads);
  const [progress, setProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  const step = Math.min(Math.max(initialStep, 1), 3);
  const canContinueToStep3 = uploads.length > 0;
  const selectedStyle = project?.style_preset ? labels[project.style_preset] || project.style_preset : "Minimal";

  const summary = useMemo(
    () => ({
      name: project?.name || "",
      productType: labels[project?.product_type || ""] || "",
      platform: labels[project?.platform || ""] || "",
      audience: project?.audience || "",
      style: labels[project?.style_preset || ""] || "",
      screenshotCount: uploads.length
    }),
    [project, uploads.length]
  );

  async function uploadFiles(files: FileList | null) {
    if (!files || !project?.id) return;

    for (let index = 0; index < files.length && uploads.length + index < 5; index++) {
      const form = new FormData();
      form.append("file", files[index]);
      form.append("position", String(uploads.length + index));
      setProgress(Math.round(((index + 1) / files.length) * 90));

      const res = await fetch(`/api/projects/${project.id}/uploads`, { method: "POST", body: form });
      if (!res.ok) continue;

      const payload = await res.json();
      setUploads((previousUploads) => [...previousUploads, payload.upload]);
    }

    setProgress(100);
    setTimeout(() => setProgress(0), 600);
  }

  async function onDelete(id: string) {
    if (!project?.id) return;

    await fetch(`/api/projects/${project.id}/uploads/${id}`, { method: "DELETE" });
    const nextUploads = uploads.filter((upload) => upload.id !== id);
    setUploads(nextUploads);
    await fetch(`/api/projects/${project.id}/uploads/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: nextUploads.map((upload) => upload.id) })
    });
  }

  async function onReorder(id: string, direction: "up" | "down") {
    if (!project?.id) return;

    const currentIndex = uploads.findIndex((upload) => upload.id === id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= uploads.length) return;

    const nextUploads = [...uploads];
    [nextUploads[currentIndex], nextUploads[targetIndex]] = [nextUploads[targetIndex], nextUploads[currentIndex]];
    setUploads(nextUploads);

    await fetch(`/api/projects/${project.id}/uploads/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: nextUploads.map((upload) => upload.id) })
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <MultiStepShell step={step} />

        {step === 1 ? (
          <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardContent className="space-y-6">
                <div>
                  <p className="eyebrow">Step 1</p>
                  <h2 className="mt-4 text-2xl font-semibold">Define the product identity once.</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                    Tell Talocode LaunchPix what you are shipping, who it is for, and the visual posture you want across the asset pack.
                  </p>
                </div>

                <form action={upsertProjectIdentity} className="grid gap-4 md:grid-cols-2">
                  <input type="hidden" name="projectId" value={project?.id || ""} />

                  <label className="grid gap-2 text-sm font-medium">
                    Project name
                    <input name="name" required defaultValue={project?.name ?? ""} className="field h-11" placeholder="Talocode launch pack" />
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    Product type
                    <select name="productType" defaultValue={project?.product_type ?? "browser_extension"} className="field-select h-11">
                      {PRODUCT_TYPE_OPTIONS.map((item) => <option key={item} value={item}>{labels[item]}</option>)}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    Target platform
                    <select name="platform" defaultValue={project?.platform ?? "chrome_web_store"} className="field-select h-11">
                      {PLATFORM_OPTIONS.map((item) => <option key={item} value={item}>{labels[item]}</option>)}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    Target audience
                    <input name="audience" required defaultValue={project?.audience ?? ""} className="field h-11" placeholder="Growth-focused product teams" />
                  </label>

                  <label className="grid gap-2 text-sm font-medium md:col-span-2">
                    One-sentence product description
                    <textarea name="description" required defaultValue={project?.description ?? ""} className="field-textarea min-h-32" placeholder="Turn raw product screenshots into polished launch assets in minutes." />
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    Website URL (optional)
                    <input name="websiteUrl" defaultValue={project?.website_url ?? ""} className="field h-11" placeholder="talocode.com" />
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    Primary brand color
                    <input name="primaryColor" required defaultValue={project?.primary_color ?? "#4F46E5"} className="field h-11" />
                  </label>

                  <label className="grid gap-2 text-sm font-medium md:col-span-2">
                    Preferred visual style
                    <select name="stylePreset" defaultValue={project?.style_preset ?? "minimal"} className="field-select h-11">
                      {STYLE_PRESET_OPTIONS.map((item) => <option key={item} value={item}>{labels[item]}</option>)}
                    </select>
                  </label>

                  <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                    <Button size="lg">
                      Save identity and continue
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {[
                {
                  icon: Sparkles,
                  title: "Keep the brief sharp",
                  text: "Use a clear product description so headlines, supporting copy, and layout direction stay aligned."
                },
                {
                  icon: Palette,
                  title: "Anchor the visual tone",
                  text: "Your style preset shapes how the assets balance contrast, density, and polish across the pack."
                },
                {
                  icon: CheckCircle2,
                  title: "Everything carries forward",
                  text: "This identity is reused through screenshot sequencing, copy generation, and final export."
                }
              ].map((item) => (
                <div key={item.title} className="surface-muted p-5">
                  <item.icon className="size-5 text-foreground" />
                  <p className="mt-4 font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {step === 2 && project ? (
          <Card>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow">Step 2</p>
                  <h2 className="mt-4 text-2xl font-semibold">Upload screenshots and set the narrative order.</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Add up to five screenshots and reorder them to define the story flow across the final launch pack.
                  </p>
                </div>
                <div className="surface-muted px-4 py-3 text-sm font-medium text-foreground">{uploads.length}/5 uploaded</div>
              </div>

              <button
                type="button"
                className="surface-muted flex min-h-48 w-full cursor-pointer flex-col items-center justify-center rounded-[4px] border border-dashed border-border/80 px-6 text-center transition-opacity hover:opacity-80"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void uploadFiles(event.dataTransfer.files);
                }}
              >
                <UploadCloud className="size-10 text-foreground" />
                <p className="mt-5 text-lg font-semibold">Drop files here or click to browse</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">PNG, JPG, or WEBP up to 10MB each</p>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(event) => void uploadFiles(event.target.files)} />
              </button>

              {progress > 0 ? (
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-2 rounded-none bg-foreground transition-all" style={{ width: `${progress}%` }} />
                </div>
              ) : null}

              {uploads.length ? <ScreenshotList uploads={uploads} onDelete={onDelete} onReorder={onReorder} /> : <UploadPlaceholder />}

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" type="button" onClick={() => router.push(`/dashboard/projects/new?projectId=${project.id}&step=1`)}>
                  Back
                </Button>
                <Button disabled={!canContinueToStep3 || isPending} type="button" onClick={() => startTransition(() => router.push(`/dashboard/projects/new?projectId=${project.id}&step=3`))}>
                  Continue to style direction
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 3 && project ? (
          <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardContent className="space-y-6">
                <div>
                  <p className="eyebrow">Step 3</p>
                  <h2 className="mt-4 text-2xl font-semibold">Dial in the visual direction before generation.</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    You are one step away from launch-ready assets. Add any nuance the generation system should preserve across the whole pack.
                  </p>
                </div>

                <form action={saveStyleDirection} className="space-y-4">
                  <input type="hidden" name="projectId" value={project.id} />

                  <label className="grid gap-2 text-sm font-medium">
                    Selected style preset
                    <input readOnly value={selectedStyle} className="field h-11 bg-muted/70" />
                  </label>

                  <label className="grid gap-2 text-sm font-medium">
                    Custom style prompt (optional)
                    <textarea
                      name="stylePrompt"
                      defaultValue={project.style_prompt ?? ""}
                      placeholder="Keep contrast high, use concise headlines, and emphasize proof points."
                      className="field-textarea min-h-36"
                    />
                  </label>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button variant="outline" type="button" onClick={() => router.push(`/dashboard/projects/new?projectId=${project.id}&step=2`)}>
                      Back
                    </Button>
                    <Button type="submit">
                      Save and continue to project
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="surface-muted p-5">
                <Palette className="size-5 text-foreground" />
                <p className="mt-4 font-semibold">Direction snapshot</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Current preset: <span className="font-medium text-foreground">{selectedStyle}</span>
                </p>
              </div>

              <div className="surface-muted p-5">
                <ImagePlus className="size-5 text-foreground" />
                <p className="mt-4 font-semibold">Output pack preview</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                  <li>5 main screenshots at 1280 x 800</li>
                  <li>1 promo tile at 440 x 280</li>
                  <li>1 hero banner at 1400 x 560</li>
                </ul>
              </div>

              <div className="surface-muted p-5">
                <Sparkles className="size-5 text-foreground" />
                <p className="mt-4 font-semibold">What happens next</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  After this step, your project becomes generation-ready and you can move straight into the asset build flow.
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <ProjectSummaryCard {...summary} />
    </div>
  );
}
