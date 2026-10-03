import { createParser } from "eventsource-parser";
import { flushSync } from "react-dom";

type ImagePayload = { type?: string; b64_json?: string; error?: { message?: string } };

async function responseError(response: Response): Promise<string> {
  const body = await response.text().catch(() => "");
  try {
    const parsed = JSON.parse(body) as { message?: string; error?: { message?: string } };
    return parsed.error?.message ?? parsed.message ?? body;
  } catch {
    return body;
  }
}

export async function streamImage(
  endpoint: string,
  input: FormData,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
): Promise<void> {
  const send = (stream: boolean) => {
    const form = new FormData();
    input.forEach((value, name) => form.append(name, value));
    form.set("stream", String(stream));
    if (!stream) form.delete("partial_images");
    return fetch(endpoint, { method: "POST", body: form });
  };

  const response = await send(true);
  if (!response.ok || !response.body) {
    throw new Error((await responseError(response)) || `Artwork creation failed (${response.status}).`);
  }

  let sawCompleted = false;
  let sawAnyEvent = false;
  let streamError: string | undefined;
  const parser = createParser({
    onEvent(event) {
      let payload: ImagePayload | undefined;
      try {
        payload = JSON.parse(event.data) as ImagePayload;
      } catch {
        return;
      }
      if (event.event === "error" || payload.type === "error") {
        sawAnyEvent = true;
        streamError = payload.error?.message ?? "Artwork creation failed.";
        return;
      }
      const type = event.event || payload.type;
      if (
        type !== "image_generation.partial_image" &&
        type !== "image_generation.completed" &&
        type !== "image_edit.partial_image" &&
        type !== "image_edit.completed"
      ) return;
      sawAnyEvent = true;
      if (!payload.b64_json) {
        streamError = "The artwork response contained no image.";
        return;
      }
      const image = payload.b64_json;
      const isFinal = type === "image_generation.completed" || type === "image_edit.completed";
      flushSync(() => onFrame(`data:image/png;base64,${image}`, isFinal));
      if (isFinal) sawCompleted = true;
    },
  });

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      let chunk: ReadableStreamReadResult<string>;
      try {
        chunk = await reader.read();
      } catch (error) {
        if (sawAnyEvent) throw error;
        break;
      }
      if (chunk.done) break;
      parser.feed(chunk.value);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  if (streamError) throw new Error(streamError);
  if (!sawAnyEvent) {
    const replay = await send(false);
    if (!replay.ok) throw new Error((await responseError(replay)) || "Artwork creation failed.");
    const json = (await replay.json()) as { data?: Array<{ b64_json?: string }> };
    const image = json.data?.[0]?.b64_json;
    if (!image) throw new Error("Artwork creation returned no image.");
    onFrame(`data:image/png;base64,${image}`, true);
    return;
  }
  if (!sawCompleted) throw new Error("Artwork creation ended before the image was finished.");
}