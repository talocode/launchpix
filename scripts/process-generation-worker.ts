const WORKER_SECRET_HEADER = "x-launchpix-worker-secret";

function resolveBaseUrl(): string {
  return process.env.LAUNCHPIX_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function main() {
  const secret = process.env.LAUNCHPIX_WORKER_SECRET?.trim();
  if (!secret) {
    console.error("LAUNCHPIX_WORKER_SECRET is required.");
    process.exit(1);
  }

  const baseUrl = resolveBaseUrl().replace(/\/$/, "");
  const workerId = process.env.LAUNCHPIX_GENERATION_WORKER_ID ?? "render-cron";
  const limit = process.env.LAUNCHPIX_GENERATION_WORKER_BATCH_LIMIT;

  const body: Record<string, unknown> = { workerId };
  if (limit) {
    const parsed = Number.parseInt(limit, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      body.limit = parsed;
    }
  }

  const response = await fetch(`${baseUrl}/api/internal/worker/generations/process`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      [WORKER_SECRET_HEADER]: secret
    },
    body: JSON.stringify(body)
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    console.error(`Worker request failed with status ${response.status} and a non-JSON response.`);
    process.exit(1);
  }

  console.log(JSON.stringify(payload, null, 2));

  if (!response.ok) {
    process.exit(1);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "failed" in payload &&
    typeof (payload as { failed?: unknown }).failed === "number" &&
    (payload as { failed: number }).failed > 0
  ) {
    process.exit(1);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});