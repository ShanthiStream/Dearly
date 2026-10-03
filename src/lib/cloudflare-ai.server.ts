// Server-only Cloudflare Workers AI client. Credentials are read from process.env
// inside each call and are never logged, returned, or sent to the browser.
const TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const IMAGE_MODEL = "@cf/runwayml/stable-diffusion-v1-5-img2img";

export class CloudflareAIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export function cloudflareCreds(): { accountId: string; token: string } | undefined {
  const accountId = process.env["CLOUDFLARE_ACCOUNT_ID"]?.trim();
  const token = process.env["CLOUDFLARE_AI_TOKEN"]?.trim();
  return accountId && token ? { accountId, token } : undefined;
}

async function run(model: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  const creds = cloudflareCreds();
  if (!creds) throw new CloudflareAIError("AI is not configured.", 500);
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${creds.accountId}/ai/run/${model}`,
    {
      method: "POST",
      signal: signal ?? null,
      headers: { Authorization: `Bearer ${creds.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    let msg = `Cloudflare AI request failed (${res.status}).`;
    try {
      const j = JSON.parse(text) as { errors?: Array<{ message?: string }> };
      msg = j.errors?.[0]?.message ?? msg;
    } catch { /* keep default */ }
    throw new CloudflareAIError(msg, res.status);
  }
  return res;
}

export async function cfText(prompt: string, signal?: AbortSignal): Promise<string> {
  const res = await run(TEXT_MODEL, { messages: [{ role: "user", content: prompt }], max_tokens: 800 }, signal);
  const json = (await res.json()) as { result?: { response?: string } };
  const text = json.result?.response ?? "";
  if (!text.trim()) throw new CloudflareAIError("No message came back. Try again.", 502);
  return text;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export async function cfEditImage(image: File, prompt: string, signal?: AbortSignal): Promise<string> {
  const input = new Uint8Array(await image.arrayBuffer());
  const res = await run(
    IMAGE_MODEL,
    { prompt, image_b64: toBase64(input), strength: 0.6, num_steps: 20, guidance: 7.5 },
    signal,
  );
  const type = res.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const json = (await res.json()) as { result?: { image?: string } };
    if (json.result?.image) return json.result.image;
    throw new CloudflareAIError("The artwork response contained no image.", 502);
  }
  return toBase64(new Uint8Array(await res.arrayBuffer()));
}
