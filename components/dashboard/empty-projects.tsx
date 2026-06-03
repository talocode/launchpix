import Link from "next/link";
import { ArrowRight, FolderPlus, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyProjectsState() {
  return (
    <div className="dashboard-page">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="dashboard-card p-6 sm:p-7">
          <div className="max-w-2xl">
            <p className="dashboard-label">Projects</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Create the first launch workspace and fill the dashboard with real output.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Add the project brief, upload screenshots, and move directly into generation from a workspace built for fast launch execution.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/projects/new">
                  Create first project
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/pricing">Compare credits</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="dashboard-card p-6 sm:p-7">
          <p className="dashboard-label">What happens here</p>
          <div className="mt-5 space-y-3">
            {[
              { icon: FolderPlus, title: "Define the brief", text: "Name the product, audience, and platform so the pack stays consistent." },
              { icon: ImageIcon, title: "Upload screenshots", text: "Add the source frames you want to convert into polished launch visuals." },
              { icon: Sparkles, title: "Generate the pack", text: "Review and export listing images, promo tiles, and hero banners." }
            ].map((item) => (
              <div key={item.title} className="dashboard-card-muted p-4">
                <div className="flex items-center gap-3">
                  <item.icon className="size-4 text-slate-300" />
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-card p-6 sm:p-7">
        <div className="grid gap-4 md:grid-cols-3">
          {["Brief", "Screenshots", "Generate"].map((label, index) => (
            <div key={label} className="dashboard-card-muted p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Step {index + 1}</p>
              <p className="mt-3 text-lg font-semibold text-white">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
