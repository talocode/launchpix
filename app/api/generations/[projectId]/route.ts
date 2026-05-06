import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/auth";
import { getProjectOverview } from "@/lib/services/projects/queries";
import { getLatestGeneration } from "@/lib/services/generations/queries";
import { runGenerationForProject } from "@/lib/services/generations/runner";
import { allowGenerationAttempt } from "@/lib/services/access/rate-limit";
import { getAccessContext } from "@/lib/services/access/permissions";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { user } = await requireUser();
  const { projectId } = await params;
  await getProjectOverview(projectId, user.id);
  const generation = await getLatestGeneration(projectId);
  const { subscription, plan } = await getAccessContext(user.id);
  return NextResponse.json({ generation, credits: subscription.credits_remaining, plan: plan.id });
}

export async function POST(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { user } = await requireUser();
  const { projectId } = await params;

  if (!allowGenerationAttempt(user.id)) {
    return NextResponse.json({ error: "Too many generation attempts. Please wait and retry." }, { status: 429 });
  }

  const { project, uploads } = await getProjectOverview(projectId, user.id);

  if (!uploads.length) {
    return NextResponse.json({ error: "At least one screenshot is required." }, { status: 400 });
  }

  try {
    const { generationId } = await runGenerationForProject(project, uploads);
    return NextResponse.json({ generationId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    const status = message.toLowerCase().includes("no credits remaining") ? 402 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
