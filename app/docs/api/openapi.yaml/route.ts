import { NextResponse } from "next/server";
import { launchpixOpenApiYaml } from "../openapi.spec";

export async function GET() {
  return new NextResponse(launchpixOpenApiYaml, {
    status: 200,
    headers: {
      "Content-Type": "application/yaml; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
