export const launchpixOpenApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "LaunchPix API",
    version: "1.0.0",
    description:
      "LaunchPix API for API-first builder workflows. Create projects, upload screenshots, and trigger publish-ready generation runs."
  },
  servers: [
    {
      url: "https://launchpix.example",
      description: "Production base URL"
    }
  ],
  security: [
    {
      LaunchPixApiKey: []
    }
  ],
  components: {
    securitySchemes: {
      LaunchPixApiKey: {
        type: "apiKey",
        in: "header",
        name: "x-launchpix-api-key"
      },
      LaunchPixUserId: {
        type: "apiKey",
        in: "header",
        name: "x-launchpix-user-id"
      }
    },
    schemas: {
      ProjectCreateRequest: {
        type: "object",
        required: ["name", "productType", "platform", "description", "audience"],
        properties: {
          name: { type: "string" },
          productType: { type: "string", example: "web_app" },
          platform: { type: "string", example: "chrome_web_store" },
          description: { type: "string" },
          audience: { type: "string" },
          websiteUrl: { type: "string", format: "uri", nullable: true },
          primaryColor: { type: "string", example: "#111111" },
          stylePreset: { type: "string", example: "minimal" }
        }
      },
      ProjectResponse: {
        type: "object",
        properties: {
          project: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              status: { type: "string", example: "ready" }
            }
          }
        }
      },
      UploadResponse: {
        type: "object",
        properties: {
          upload: {
            type: "object",
            properties: {
              id: { type: "string" },
              project_id: { type: "string" },
              position: { type: "integer" }
            }
          }
        }
      },
      GenerationResponse: {
        type: "object",
        properties: {
          generationId: { type: "string" }
        }
      },
      GenerationStatusResponse: {
        type: "object",
        properties: {
          generation: {
            type: "object",
            properties: {
              id: { type: "string" },
              status: { type: "string", example: "rendering_assets" }
            }
          }
        }
      }
    }
  },
  paths: {
    "/api/v1/projects": {
      get: {
        summary: "List API-visible projects for the current owner",
        security: [{ LaunchPixApiKey: [], LaunchPixUserId: [] }],
        responses: {
          "200": {
            description: "List of projects"
          },
          "401": { description: "Missing or invalid API key" }
        }
      },
      post: {
        summary: "Create a new project workspace",
        security: [{ LaunchPixApiKey: [], LaunchPixUserId: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProjectCreateRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Project created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectResponse" }
              }
            }
          },
          "400": { description: "Invalid payload" },
          "401": { description: "Missing or invalid API key" }
        }
      }
    },
    "/api/v1/projects/{projectId}/uploads": {
      post: {
        summary: "Upload a screenshot as multipart form data",
        security: [{ LaunchPixApiKey: [], LaunchPixUserId: [] }],
        parameters: [
          {
            name: "projectId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: { type: "string", format: "binary" },
                  position: { type: "integer", example: 0 }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Upload saved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UploadResponse" }
              }
            }
          },
          "400": { description: "Missing file or invalid metadata" },
          "404": { description: "Project not found" }
        }
      }
    },
    "/api/v1/projects/{projectId}/generate": {
      get: {
        summary: "Fetch the latest generation for a project",
        security: [{ LaunchPixApiKey: [], LaunchPixUserId: [] }],
        parameters: [
          {
            name: "projectId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Latest generation record",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GenerationStatusResponse" }
              }
            }
          },
          "404": { description: "Project not found" }
        }
      },
      post: {
        summary: "Start a generation run from uploaded screenshots",
        security: [{ LaunchPixApiKey: [], LaunchPixUserId: [] }],
        parameters: [
          {
            name: "projectId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "201": {
            description: "Generation started",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GenerationResponse" }
              }
            }
          },
          "400": { description: "At least one screenshot is required" },
          "404": { description: "Project not found" },
          "429": { description: "Too many generation attempts" }
        }
      }
    }
  }
} as const;

function formatYamlScalar(value: unknown) {
  if (value === null) return "null";
  if (value === true) return "true";
  if (value === false) return "false";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  if (typeof value !== "string") return JSON.stringify(value);
  if (value === "") return '""';
  if (/^[A-Za-z0-9._/-]+$/.test(value)) return value;
  return JSON.stringify(value);
}

function toYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);

  if (Array.isArray(value)) {
    if (!value.length) return `${pad}[]`;
    return value
      .map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const nested = toYaml(item, indent + 1).split("\n");
          const [first, ...rest] = nested;
          return `${pad}- ${first.trimStart()}\n${rest.join("\n")}`;
        }
        if (Array.isArray(item)) {
          const nested = toYaml(item, indent + 1).split("\n");
          const [first, ...rest] = nested;
          return `${pad}- ${first.trimStart()}\n${rest.join("\n")}`;
        }
        return `${pad}- ${formatYamlScalar(item)}`;
      })
      .join("\n");
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return `${pad}{}`;
    return entries
      .map(([key, entry]) => {
        if (Array.isArray(entry)) {
          if (!entry.length) return `${pad}${key}: []`;
          const nested = toYaml(entry, indent + 1);
          const prefix = `${pad}${key}:\n`;
          return prefix + nested;
        }
        if (entry && typeof entry === "object") {
          const nested = toYaml(entry, indent + 1);
          const prefix = `${pad}${key}:\n`;
          return prefix + nested;
        }
        return `${pad}${key}: ${formatYamlScalar(entry)}`;
      })
      .join("\n");
  }

  return `${pad}${formatYamlScalar(value)}`;
}

export const launchpixOpenApiYaml = toYaml(launchpixOpenApiSpec) + "\n";
