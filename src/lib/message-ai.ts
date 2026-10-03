import type { MessageRequest } from "@/domain/services/message-writer";

export async function writeMessages(
  req: MessageRequest,
  refine?: { refinement: string; current: string },
): Promise<string[]> {
  const res = await fetch("/api/write-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...req, ...refine }),
  });
  if (!res.ok) throw new Error((await res.text()) || "Message writing failed.");
  const data = (await res.json()) as { options: string[] };
  return data.options;
}
