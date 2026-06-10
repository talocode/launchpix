import { NextResponse } from "next/server";
import { launchpixOpenApiSpec } from "../openapi.spec";

export async function GET() {
  return new NextResponse(JSON.stringify(launchpixOpenApiSpec, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
