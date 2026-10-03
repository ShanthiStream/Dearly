// Server-only Gemini client. The API key is read from process.env inside each call
// and is never sent to the browser.
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function geminiKey(): string | undefined {
  const key = process.env["GEMINI_API_KEY"]?.trim();
  // Presence check only — the key itself is never logged or returned.
  return key ? key : undefined;
}

function textModel() {
  return process.env["GEMINI_TEXT_MODEL"] || "gemini-2.0-flash";
}
function imageModel() {
  return process.env["GEMINI_IMAGE_MODEL"] || "gemini-2.0-flash";
}

type Part = { text?: string; inlineData?: { mimeType: string; data: string }; inline_data?: { mime_type: string; data: string } };
type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Part[] }; finishReason?: string }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

export class GeminiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function call(model: string, apiKey: string, body: unknown, signal?: AbortSignal): Promise<GeminiResponse> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/${model}:generateContent`, {
      method: "POST",
      signal: signal ?? null,
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Network error";
    throw new GeminiError(
      `Failed to connect to Google Gemini API (${detail}). Please verify your network connection and API key.`,
      502
    );
  }
  const json = (await res.json().catch(() => ({}))) as GeminiResponse;
  if (!res.ok) {
    const errorMsg = json.error?.message ?? `Gemini request failed (${res.status}).`;
    throw new GeminiError(errorMsg, res.status);
  }
  if (json.promptFeedback?.blockReason) {
    throw new GeminiError("This request was declined by the AI provider.", 422);
  }
  return json;
}

export async function geminiText(apiKey: string, prompt: string, signal?: AbortSignal): Promise<string> {
  const json = await call(textModel(), apiKey, { contents: [{ role: "user", parts: [{ text: prompt }] }] }, signal);
  const text = (json.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
  if (!text.trim()) throw new GeminiError("No message came back. Try again.", 502);
  return text;
}

export async function geminiEditImage(apiKey: string, image: File, prompt: string, signal?: AbortSignal): Promise<string> {
  const bytes = new Uint8Array(await image.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const json = await call(
    imageModel(),
    apiKey,
    {
      contents: [
        { role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: image.type, data: btoa(binary) } }] },
      ],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    },
    signal,
  );
  for (const part of json.candidates?.[0]?.content?.parts ?? []) {
    const data = part.inlineData?.data ?? part.inline_data?.data;
    if (data) return data;
  }
  throw new GeminiError("The artwork response contained no image.", 502);
}
