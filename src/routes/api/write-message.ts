import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CloudflareAIError, cfText, cloudflareCreds } from "@/lib/cloudflare-ai.server";
import { GeminiError, geminiKey, geminiText } from "@/lib/gemini.server";

const LANG: Record<string, string> = {
  en: "English", ar: "Arabic", fr: "French", es: "Spanish", ru: "Russian", hi: "Hindi", zh: "Simplified Chinese",
};

const schema = z.object({
  recipientNickname: z.string().max(80),
  relationship: z.string().max(40),
  occasion: z.string().max(40),
  mood: z.string().max(40),
  memory: z.string().max(600),
  senderName: z.string().max(80),
  language: z.string().max(20),
  refinement: z.string().max(40).optional(),
  current: z.string().max(2000).optional(),
});

import { generateMessageOptions, refineMessage } from "@/domain/services/message-writer";
import type { MoodId, OccasionId, RecipientId } from "@/domain/entities/types";
import type { Refinement } from "@/domain/content";

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    if (!host) return true;
    if (originHost === host) return true;
    if (originHost.includes("localhost") || originHost.includes("127.0.0.1")) return true;
    return false;
  } catch {
    return true;
  }
}

function getLocalOptions(data: z.infer<typeof schema>): string[] {
  const req = {
    recipientNickname: data.recipientNickname,
    relationship: data.relationship as RecipientId,
    occasion: data.occasion as OccasionId,
    mood: data.mood as MoodId,
    memory: data.memory,
    senderName: data.senderName,
    language: data.language,
  };
  if (data.refinement && data.current) {
    return [refineMessage(data.current, data.refinement as Refinement, req)];
  }
  return generateMessageOptions(req).map((opt) => opt.text);
}

function splitOptions(out: string): string[] {
  let parts = out.split(/\n\s*---+\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) parts = out.split(/(?<=\n— [^\n]+)\s*\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return parts.slice(0, 3);
}

function buildPrompt(d: z.infer<typeof schema>) {
  const v = (s: string) => (s && s !== "unspecified" ? s : "not specified");
  const language = LANG[d.language.split("-")[0] ?? "en"] ?? "English";
  const facts = [
    `Recipient nickname: ${d.recipientNickname.trim() || "not given (do not invent a name)"}`,
    `Relationship: ${v(d.relationship)}`,
    `Occasion: ${v(d.occasion)}`,
    `Mood/tone: ${v(d.mood)}`,
    `Shared memory or detail: ${d.memory.trim() || "none"}`,
    `Sender name for sign-off: ${d.senderName.trim() || "none (no sign-off)"}`,
  ].join("\n");
  const base = `You write short personal messages for a photo card sent to friends and family. Write in ${language}. Use names and facts exactly as given; never invent names, events, or details. No hashtags, no emojis unless the tone is funny. If a sender name is given, end with a new line "— {name}".`;
  if (d.refinement && d.current) {
    return `${base}\n\nDetails:\n${facts}\n\nRewrite this message to be: ${d.refinement}. Return only the rewritten message.\n\nMessage:\n${d.current}`;
  }
  return `${base}\n\nDetails:\n${facts}\n\nWrite three different options: one short (1 sentence), one medium (2-3 sentences), one longer (4-5 sentences). Separate them with a line containing only ---. Return only the messages.`;
}

export const Route = createFileRoute("/api/write-message")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!sameOrigin(request)) return new Response("This request must come from Dearly Studio.", { status: 403 });
        const parsed = schema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Invalid request.", { status: 400 });

        const geminiApiKey = geminiKey();
        if (geminiApiKey) {
          try {
            const out = await geminiText(geminiApiKey, buildPrompt(parsed.data), request.signal);
            const opts = parsed.data.refinement
              ? [out.trim()]
              : splitOptions(out);
            if (opts.length > 0) return Response.json({ options: opts });
          } catch (e) {
            console.warn("Gemini text generation failed, falling back to smart local composer:", e);
            return Response.json({ options: getLocalOptions(parsed.data), provider: "local-fallback" });
          }
        }

        const gKey = cloudflareCreds();
        if (gKey) {
          try {
            const out = await cfText(buildPrompt(parsed.data), request.signal);
            const opts = parsed.data.refinement
              ? [out.trim()]
              : splitOptions(out);
            if (opts.length > 0) return Response.json({ options: opts });
          } catch (e) {
            console.warn("Cloudflare text generation failed, falling back to smart local composer:", e);
            return Response.json({ options: getLocalOptions(parsed.data), provider: "local-fallback" });
          }
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ options: getLocalOptions(parsed.data), provider: "local" });
        }


        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          signal: request.signal,
          headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            input: buildPrompt(parsed.data),
            stream: true,
            store: false,
            reasoning: { effort: "low" },
          }),
        });
        if (!upstream.ok || !upstream.body) {
          const body = await upstream.text();
          let msg = "Message writing failed.";
          try {
            const j = JSON.parse(body) as { message?: string; error?: { message?: string } };
            msg = j.error?.message ?? j.message ?? msg;
          } catch { /* keep default */ }
          return new Response(msg, { status: upstream.status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }

        // Consume the stream server-side and return the final text.
        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let text = "";
        let failure: string | null = null;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            for (const line of frame.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const ev = JSON.parse(data) as { type?: string; delta?: string; response?: { error?: { message?: string } }; message?: string };
                if (ev.type === "response.output_text.delta" && ev.delta) text += ev.delta;
                if (ev.type === "response.failed" || ev.type === "error") failure = ev.response?.error?.message ?? ev.message ?? "Message writing failed.";
              } catch { /* partial */ }
            }
          }
        }
        if (failure) return new Response(failure, { status: 502 });
        const options = parsed.data.refinement
          ? [text.trim()]
          : text.split(/\n\s*---+\s*\n/).map((s) => s.trim()).filter(Boolean).slice(0, 3);
        if (!options.length) return new Response("No message came back. Try again.", { status: 502 });
        return Response.json({ options });
      },
    },
  },
});
