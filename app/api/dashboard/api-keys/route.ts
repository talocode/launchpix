import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/auth";
import { createCustomerApiKey } from "@/lib/services/api-keys/create-api-key";
import { listCustomerApiKeys } from "@/lib/services/api-keys/list-api-keys";
import { renameCustomerApiKey } from "@/lib/services/api-keys/rename-api-key";
import { revokeCustomerApiKey } from "@/lib/services/api-keys/revoke-api-key";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Please sign in to manage API keys." }, { status: 401 });
}

export async function GET() {
  try {
    const { user } = await requireUser();
    const keys = await listCustomerApiKeys(user.id);
    return NextResponse.json({ keys });
  } catch (error) {
    const maybeRedirectDigest = typeof error === "object" && error !== null ? String((error as { digest?: string }).digest || "") : "";
    if (maybeRedirectDigest.includes("NEXT_REDIRECT")) return unauthorizedResponse();
    const message = error instanceof Error ? error.message : "Could not load API keys.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireUser();
    const body = (await request.json().catch(() => ({}))) as { name?: string; environment?: "live" | "test" };
    const created = await createCustomerApiKey({
      userId: user.id,
      name: body.name,
      environment: body.environment ?? "live"
    });

    return NextResponse.json(
      {
        key: {
          id: created.apiKeyId,
          name: created.name,
          prefix: `${created.keyPrefix}...`,
          token: created.token
        },
        warning: "This key will only be shown once. Copy it now and store it securely."
      },
      { status: 201 }
    );
  } catch (error) {
    const maybeRedirectDigest = typeof error === "object" && error !== null ? String((error as { digest?: string }).digest || "") : "";
    if (maybeRedirectDigest.includes("NEXT_REDIRECT")) return unauthorizedResponse();
    const message = error instanceof Error ? error.message : "Could not create API key.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await requireUser();
    const body = (await request.json()) as { apiKeyId?: string; name?: string };
    if (!body.apiKeyId || !body.name) {
      return NextResponse.json({ error: "apiKeyId and name are required." }, { status: 400 });
    }

    const key = await renameCustomerApiKey({
      userId: user.id,
      apiKeyId: body.apiKeyId,
      name: body.name
    });

    return NextResponse.json({ key });
  } catch (error) {
    const maybeRedirectDigest = typeof error === "object" && error !== null ? String((error as { digest?: string }).digest || "") : "";
    if (maybeRedirectDigest.includes("NEXT_REDIRECT")) return unauthorizedResponse();
    const message = error instanceof Error ? error.message : "Could not rename API key.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const { user } = await requireUser();
    const body = (await request.json()) as { apiKeyId?: string };
    if (!body.apiKeyId) {
      return NextResponse.json({ error: "apiKeyId is required." }, { status: 400 });
    }

    const key = await revokeCustomerApiKey({
      userId: user.id,
      apiKeyId: body.apiKeyId
    });

    return NextResponse.json({ key });
  } catch (error) {
    const maybeRedirectDigest = typeof error === "object" && error !== null ? String((error as { digest?: string }).digest || "") : "";
    if (maybeRedirectDigest.includes("NEXT_REDIRECT")) return unauthorizedResponse();
    const message = error instanceof Error ? error.message : "Could not revoke API key.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}