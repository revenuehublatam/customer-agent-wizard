// Minimal Anthropic client wrapper used by Edge Functions.
// Avoids the npm SDK to keep cold start small in Deno runtime.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-opus-4-7";

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  system?: string;
  stream?: boolean;
}

export interface AnthropicResponse {
  text: string;
  input_tokens: number;
  output_tokens: number;
  raw: any;
}

function getApiKey(): string {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }
  return key;
}

export async function callAnthropic(
  messages: AnthropicMessage[],
  options: AnthropicOptions = {},
): Promise<AnthropicResponse> {
  const body = {
    model: options.model ?? DEFAULT_MODEL,
    max_tokens: options.max_tokens ?? 8000,
    temperature: options.temperature ?? 0.3,
    system: options.system,
    messages,
  };

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": getApiKey(),
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const text = (json.content ?? [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");

  return {
    text,
    input_tokens: json.usage?.input_tokens ?? 0,
    output_tokens: json.usage?.output_tokens ?? 0,
    raw: json,
  };
}

export async function callAnthropicStream(
  messages: AnthropicMessage[],
  options: AnthropicOptions = {},
): Promise<ReadableStream<Uint8Array>> {
  const body = {
    model: options.model ?? DEFAULT_MODEL,
    max_tokens: options.max_tokens ?? 8000,
    temperature: options.temperature ?? 0.3,
    system: options.system,
    messages,
    stream: true,
  };

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": getApiKey(),
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text();
    throw new Error(`Anthropic stream error ${res.status}: ${errText}`);
  }

  return res.body;
}

export function substitutePlaceholders(
  template: string,
  data: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = data[key];
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    return JSON.stringify(value);
  });
}
