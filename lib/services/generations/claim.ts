import type { GenerationRecord } from "@/types/project";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isClaimableGenerationStatus,
  isInProgressGenerationStatus,
  isTerminalGenerationStatus,
  type GenerationStatus
} from "@/lib/services/generations/status";

const CLAIM_TARGET_STATUS: GenerationStatus = "analyzing";

export type ClaimGenerationFailureReason = "not_found" | "terminal" | "in_progress" | "not_claimable";

export type ClaimGenerationResult =
  | { claimed: true; generation: GenerationRecord }
  | { claimed: false; reason: ClaimGenerationFailureReason };

type ClaimGenerationInput = {
  supabase: SupabaseClient;
  generationId: string;
  workerId?: string;
  now?: Date;
};

async function loadGeneration(supabase: SupabaseClient, generationId: string) {
  const { data, error } = await supabase.from("generations").select("*").eq("id", generationId).maybeSingle();
  if (error) throw new Error(error.message);
  return data as GenerationRecord | null;
}

function classifyUnclaimedGeneration(generation: GenerationRecord | null): ClaimGenerationFailureReason {
  if (!generation) return "not_found";
  if (isTerminalGenerationStatus(generation.status)) return "terminal";
  if (isInProgressGenerationStatus(generation.status)) return "in_progress";
  return "not_claimable";
}

export async function claimGenerationForProcessing(input: ClaimGenerationInput): Promise<ClaimGenerationResult> {
  const { supabase, generationId, workerId, now = new Date() } = input;

  const { data: claimedGeneration, error: claimError } = await supabase
    .from("generations")
    .update({ status: CLAIM_TARGET_STATUS, updated_at: now.toISOString() })
    .eq("id", generationId)
    .eq("status", "queued")
    .select("*")
    .maybeSingle();

  if (claimError) throw new Error(claimError.message);

  if (claimedGeneration) {
    return { claimed: true, generation: claimedGeneration as GenerationRecord };
  }

  const existingGeneration = await loadGeneration(supabase, generationId);
  const reason = classifyUnclaimedGeneration(existingGeneration);

  if (workerId) {
    console.info(
      `[launchpix:generation] claim_rejected ${JSON.stringify({
        generationId,
        workerId,
        reason,
        status: existingGeneration?.status ?? null
      })}`
    );
  }

  return { claimed: false, reason };
}

export function assertGenerationClaimable(status: string): boolean {
  return isClaimableGenerationStatus(status);
}