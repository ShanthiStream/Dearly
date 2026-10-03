import { toast } from "sonner";
import type { CreationDraft } from "@/domain/entities/types";
import { renderCardToBlob } from "./exportCard";

function fileNameFor(draft: CreationDraft) {
  return `${(draft.title || "dearly-card").replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "dearly-card"}.png`;
}

/**
 * Shares the finished card image (plus message). On phones this opens the
 * share sheet with the picture attached, where WhatsApp can be chosen.
 * Where image sharing isn't supported, the image is saved and WhatsApp opens
 * with the message so the user can attach it.
 */
export async function shareCard(draft: CreationDraft, target: "whatsapp" | "any") {
  let file: File;
  try {
    const blob = await renderCardToBlob(draft);
    file = new File([blob], fileNameFor(draft), { type: "image/png" });
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Could not create the image.");
    return;
  }
  const text = draft.message || "";
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  if (nav?.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text, title: draft.title });
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") toast.error("Sharing didn't work. Try saving the image.");
    }
    return;
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  if (target === "whatsapp") {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    toast.success("Card image saved. Attach it in WhatsApp with the paperclip.");
  } else {
    if (text) await nav?.clipboard?.writeText(text).catch(() => undefined);
    toast.success("Card image saved and message copied.");
  }
}
