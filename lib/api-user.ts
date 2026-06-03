import { NextResponse } from "next/server";

export function getApiUserId(request: Request): string | null {
  const headerUserId = request.headers.get("x-launchpix-user-id") ?? request.headers.get("x-user-id");
  if (!headerUserId) return null;
  const userId = headerUserId.trim();
  if (!userId) return null;
  return userId;
}

export function requireApiUserId(request: Request): { userId: string } | { response: NextResponse } {
  const userId = getApiUserId(request);
  if (!userId) {
    return {
      response: NextResponse.json(
        {
          error: "Missing user id. Send x-launchpix-user-id with the owner UUID."
        },
        { status: 400 }
      )
    };
  }

  return { userId };
}
