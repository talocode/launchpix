type GenerationLogLevel = "info" | "warn" | "error";

type GenerationLogContext = Record<string, unknown>;

const LOG_PREFIX = "[launchpix:generation]";

function redactText(value: string) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return value;
  return value.replaceAll(apiKey, "[redacted]");
}

function sanitizeContext(context: GenerationLogContext) {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => {
      if (typeof value === "string") return [key, redactText(value)];
      if (typeof value === "number" || typeof value === "boolean" || value === null) return [key, value];
      if (Array.isArray(value)) return [key, value.map((entry) => (typeof entry === "string" ? redactText(entry) : entry))];
      return [key, value];
    })
  );
}

export function logGenerationEvent(level: GenerationLogLevel, event: string, context: GenerationLogContext = {}) {
  const payload = {
    event,
    ...sanitizeContext(context)
  };

  const message = `${LOG_PREFIX} ${JSON.stringify(payload)}`;
  if (level === "error") console.error(message);
  else if (level === "warn") console.warn(message);
  else console.info(message);
}

export function logGenerationError(event: string, error: unknown, context: GenerationLogContext = {}) {
  const message = error instanceof Error ? error.message : String(error);
  logGenerationEvent("error", event, {
    ...context,
    error: redactText(message)
  });
}
