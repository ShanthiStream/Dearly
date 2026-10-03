import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CreationDraft } from "@/domain/entities/types";
import { artworkKey, isArtStyleId } from "@/lib/art-style";
import { streamImage } from "@/lib/stream-image";
import { applyClientArtStyle } from "@/lib/client-art-transform";

function dataUrlToFile(dataUrl: string, fileName: string | null): File {
  const [metadata, encoded = ""] = dataUrl.split(",", 2);
  const mimeType = metadata?.match(/^data:([^;]+)/)?.[1] ?? "image/png";
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new File([bytes], fileName || "dearly-photo.png", { type: mimeType });
}

async function photoToFile(photo: NonNullable<CreationDraft["photo"]>): Promise<File> {
  const source = photo.dataUrl;
  if (!source) throw new Error("Add a photo before creating artwork.");
  if (source.startsWith("data:")) return dataUrlToFile(source, photo.fileName);
  const response = await fetch(source);
  if (!response.ok) throw new Error("The selected photo could not be opened.");
  const blob = await response.blob();
  return new File([blob], photo.fileName || "dearly-photo.jpg", {
    type: blob.type || "image/jpeg",
  });
}

export function ArtworkGenerator({
  draft,
  update,
}: {
  draft: CreationDraft;
  update: (patch: Partial<CreationDraft>) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [partialImage, setPartialImage] = useState<string | null>(null);
  const styleId = draft.styleId;
  const key = artworkKey(styleId, draft.styleIntensity);
  const finished = draft.artworkRenders?.[key];
  const processing = draft.styleJobStatus === "processing";
  const autoStartedKey = useRef<string | null>(null);

  async function createArtwork() {
    if (!draft.photo || !isArtStyleId(styleId)) {
      toast.error("Add a photo before creating artwork.");
      return;
    }
    setError(null);
    setPartialImage(null);
    update({ styleJobStatus: "processing" });
    try {
      const form = new FormData();
      form.set("image", await photoToFile(draft.photo));
      form.set("styleId", styleId);
      form.set("intensity", draft.styleIntensity);
      await streamImage("/api/edit-artwork", form, (dataUrl, isFinal) => {
        setPartialImage(dataUrl);
        if (isFinal) {
          update({
            artworkRenders: { ...(draft.artworkRenders ?? {}), [key]: dataUrl },
            styleJobStatus: "complete",
          });
          setPartialImage(null);
        }
      });
    } catch (caught) {
      if (draft.photo?.dataUrl) {
        try {
          const clientStyled = await applyClientArtStyle(draft.photo.dataUrl, styleId, draft.styleIntensity);
          update({
            artworkRenders: { ...(draft.artworkRenders ?? {}), [key]: clientStyled },
            styleJobStatus: "complete",
          });
          setPartialImage(null);
          return;
        } catch {
          // continue to fallback error
        }
      }
      const message = caught instanceof Error ? caught.message : "Artwork creation failed.";
      setError(message);
      update({ styleJobStatus: "failed" });
    }
  }

  useEffect(() => {
    if (
      draft.styleJobStatus !== "queued" ||
      !draft.photo ||
      !isArtStyleId(styleId) ||
      autoStartedKey.current === key
    ) {
      return;
    }

    autoStartedKey.current = key;
    void createArtwork();
  }, [draft.photo, draft.styleJobStatus, key, styleId]);

  if (styleId === "original") return null;

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      {partialImage ? (
        <img
          src={partialImage}
          alt="Artwork being created"
          className="aspect-square w-full rounded-xl object-cover blur-xl transition-[filter]"
        />
      ) : null}
      <Button
        type="button"
        className="h-11 w-full rounded-xl"
        onClick={createArtwork}
        disabled={processing || !draft.photo}
      >
        {processing ? (
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
        ) : finished ? (
          <Check className="mr-2 size-4" aria-hidden="true" />
        ) : (
          <Sparkles className="mr-2 size-4" aria-hidden="true" />
        )}
        {processing ? "Creating artwork…" : finished ? "Create again" : "Create artwork"}
      </Button>
      <p className="text-center text-xs text-muted-foreground" aria-live="polite">
        {processing
          ? "This can take a minute. Keep this page open."
          : finished
            ? "Your finished artwork is now used in previews and downloads."
            : "The original photo stays unchanged."}
      </p>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}