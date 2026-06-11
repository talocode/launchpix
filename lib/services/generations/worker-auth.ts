import { NextResponse } from "next/server";

const WORKER_SECRET_HEADER = "x-launchpix-worker-secret";

export function getConfiguredWorkerSecret(): string | null {
  const secret = process.env.LAUNCHPIX_WORKER_SECRET;
  return secret && secret.trim() ? secret : null;
}

export function readWorkerSecretFromRequest(request: Request): string | null {
  const headerSecret = request.headers.get(WORKER_SECRET_HEADER);
  if (headerSecret) return headerSecret;

  const bearer = request.headers.get("authorization");
  if (bearer?.toLowerCase().startsWith("bearer ")) {
    return bearer.slice(7).trim() || null;
  }

  return null;
}

export function hasValidLaunchPixWorkerSecret(request: Request): boolean {
  const configuredSecret = getConfiguredWorkerSecret();
  if (!configuredSecret) return false;

  const providedSecret = readWorkerSecretFromRequest(request);
  return Boolean(providedSecret && providedSecret === configuredSecret);
}

export function requireLaunchPixWorkerSecret(request: Request): NextResponse | null {
  if (!getConfiguredWorkerSecret()) {
    return NextResponse.json({ error: "Worker secret is not configured." }, { status: 503 });
  }

  if (hasValidLaunchPixWorkerSecret(request)) return null;

  return NextResponse.json({ error: "Missing or invalid worker secret." }, { status: 401 });
}