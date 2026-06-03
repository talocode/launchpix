import { NextResponse } from "next/server";

const API_KEY_HEADER = "x-launchpix-api-key";

export function hasValidLaunchPixApiKey(request: Request): boolean {
  const configuredKey = process.env.LAUNCHPIX_API_KEY;
  if (!configuredKey) return false;

  const headerKey = request.headers.get(API_KEY_HEADER) ?? request.headers.get("x-api-key");
  const bearer = request.headers.get("authorization");
  const bearerKey = bearer?.toLowerCase().startsWith("bearer ") ? bearer.slice(7).trim() : null;

  const providedKey = headerKey ?? bearerKey;
  return Boolean(providedKey && providedKey === configuredKey);
}

export function requireLaunchPixApiKey(request: Request): NextResponse | null {
  if (hasValidLaunchPixApiKey(request)) return null;

  return NextResponse.json(
    {
      error: "Missing or invalid API key. Get your key and send it as x-launchpix-api-key or Authorization: Bearer <key>."
    },
    { status: 401 }
  );
}
