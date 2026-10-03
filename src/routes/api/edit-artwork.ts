import { createFileRoute } from "@tanstack/react-router";
import { buildArtEditPrompt, isArtIntensity, isArtStyleId } from "@/lib/art-style";
import { editImage, imageSettings } from "@/lib/image-gateway.server";
import { CloudflareAIError, cfEditImage, cloudflareCreds } from "@/lib/cloudflare-ai.server";
import { GeminiError, geminiEditImage, geminiKey } from "@/lib/gemini.server";

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function messageFromErrorBody(body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string; error?: { message?: string } };
    return parsed.error?.message ?? parsed.message ?? body;
  } catch {
    return body;
  }
}

export const Route = createFileRoute("/api/edit-artwork")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
        let isAllowed = true;
        if (origin && host) {
          try {
            const originHost = new URL(origin).host;
            isAllowed = originHost === host || originHost.includes("localhost") || originHost.includes("127.0.0.1");
          } catch {
            isAllowed = true;
          }
        }
        if (!isAllowed) {
          return new Response("This artwork request must come from Dearly Studio.", { status: 403 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"] ?? "";
        if (!apiKey && !cloudflareCreds() && !geminiKey()) return new Response("Artwork creation is not configured.", { status: 500 });

        const incoming = await request.formData();
        const image = incoming.get("image");
        const styleId = incoming.get("styleId");
        const intensity = incoming.get("intensity");
        if (!(image instanceof File) || typeof styleId !== "string" || typeof intensity !== "string") {
          return new Response("A photo, artist, and strength are required.", { status: 400 });
        }
        if (!ALLOWED_TYPES.has(image.type) || image.size === 0 || image.size > MAX_IMAGE_BYTES) {
          return new Response("Use a JPEG, PNG, or WebP image smaller than 25 MB.", { status: 400 });
        }
        if (!isArtStyleId(styleId) || !isArtIntensity(intensity)) {
          return new Response("Choose a supported artist and strength.", { status: 400 });
        }

        const geminiApiKey = geminiKey();
        if (geminiApiKey) {
          try {
            const b64 = await geminiEditImage(geminiApiKey, image, buildArtEditPrompt(styleId, intensity), request.signal);
            if (incoming.get("stream") === "false") return Response.json({ data: [{ b64_json: b64 }] });
            const sse = `event: image_edit.completed\ndata: ${JSON.stringify({ type: "image_edit.completed", b64_json: b64 })}\n\n`;
            return new Response(sse, {
              headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store" },
            });
          } catch (e) {
            const detail = e instanceof Error ? e.message : "Artwork creation failed.";
            const status = e instanceof GeminiError ? e.status : 502;
            return new Response(
              detail.includes("AIzaSy") || detail.includes("Gemini")
                ? detail
                : `Gemini artwork transformation failed: ${detail}`,
              {
                status,
                headers: { "Content-Type": "text/plain; charset=utf-8" },
              },
            );
          }
        }

        const gKey = cloudflareCreds();
        if (gKey) {
          try {
            const b64 = await cfEditImage(image, buildArtEditPrompt(styleId, intensity), request.signal);
            if (incoming.get("stream") === "false") return Response.json({ data: [{ b64_json: b64 }] });
            const sse = `event: image_edit.completed\ndata: ${JSON.stringify({ type: "image_edit.completed", b64_json: b64 })}\n\n`;
            return new Response(sse, {
              headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store" },
            });
          } catch (e) {
            const status = e instanceof CloudflareAIError ? e.status : 500;
            return new Response(e instanceof Error ? e.message : "Artwork creation failed.", {
              status,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            });
          }
        }

        const form = new FormData();
        form.set("image", image);
        form.set("prompt", buildArtEditPrompt(styleId, intensity));
        form.set("stream", incoming.get("stream") === "false" ? "false" : "true");
        const upstream = await editImage({ ...imageSettings, apiKey }, form);

        if (!upstream.ok && upstream.headers.get("content-type")?.includes("application/json")) {
          const body = await upstream.text();
          return new Response(messageFromErrorBody(body) || "Artwork creation failed.", {
            status: upstream.status,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});