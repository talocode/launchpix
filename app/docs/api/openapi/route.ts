import { NextResponse } from "next/server";
import { launchpixOpenApiSpec } from "../openapi.spec";

export async function GET() {
  return NextResponse.json(launchpixOpenApiSpec, {
    headers: {
      "Cache-Control": "public, max-age=300"
    }
  });
}
