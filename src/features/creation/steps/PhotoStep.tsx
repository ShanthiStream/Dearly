import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Camera, ImageUp, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { samplePhotos } from "@/domain/samples";
import type { CreationDraft } from "@/domain/entities/types";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/i18n";

const ACCEPTED = "image/jpeg,image/png,image/heic,image/heif,image/webp";
const MAX_BYTES = 25 * 1024 * 1024;

export function PhotoStep({
  draft,
  update,
}: {
  draft: CreationDraft;
  update: (patch: Partial<CreationDraft>) => void;
}) {
  const t = useT();
  const [rightsChecked, setRightsChecked] = useState(Boolean(draft.rightsConfirmedAt));
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const confirmed = Boolean(draft.rightsConfirmedAt) || rightsChecked;

  function handleRights(checked: boolean) {
    setRightsChecked(checked);
    update({ rightsConfirmedAt: checked ? new Date().toISOString() : null });
  }

  function openPicker() {
    if (!confirmed) {
      setError(t("step.photo.error.confirmRequired"));
      return;
    }
    setError(null);
    inputRef.current?.click();
  }

  function readFile(file: File) {
    if (file.size > MAX_BYTES) {
      setError(t("step.photo.error.tooLarge"));
      return;
    }
    setError(null);
    setProgress(10);
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 90));
    };
    reader.onerror = () => {
      setProgress(null);
      setError(t("step.photo.error.readFailed"));
    };
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = new window.Image();
      img.onload = () => {
        setProgress(100);
        update({
          photo: {
            dataUrl,
            sampleId: null,
            fileName: file.name,
            widthPx: img.naturalWidth,
            heightPx: img.naturalHeight,
          },
          title: draft.title === "Untitled" ? file.name.replace(/\.[^.]+$/, "") : draft.title,
          styleId: "original",
          styleJobStatus: "complete",
          artworkRenders: {},
          imageRotation: 0,
        });
        setTimeout(() => setProgress(null), 400);
        toast.success(t("step.photo.toast.added"));
      };
      img.onerror = () => {
        setProgress(null);
        setError(t("step.photo.error.openFailed"));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  const photo = draft.photo;
  const lowRes = photo ? Math.min(photo.widthPx, photo.heightPx) < 900 : false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t("step.photo.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("step.photo.subtitle")}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <label className="flex items-start gap-3">
          <Checkbox
            checked={confirmed}
            onCheckedChange={(v) => handleRights(v === true)}
            aria-describedby="rights-help"
            className="mt-0.5"
          />
          <span className="text-sm">
            {t("step.photo.rights")}
            <span id="rights-help" className="mt-1 block text-xs text-muted-foreground">
              {t("step.photo.rightsHelp.pre")}{" "}
              <Link to="/terms" className="underline underline-offset-2">
                {t("step.photo.rightsHelp.terms")}
              </Link>{" "}
              {t("step.photo.rightsHelp.and")}{" "}
              <Link to="/privacy" className="underline underline-offset-2">
                {t("step.photo.rightsHelp.privacy")}
              </Link>
              . {t("step.photo.rightsHelp.under13")}
            </span>
          </span>
        </label>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!confirmed) {
            setError(t("step.photo.error.confirmRequiredDrop"));
            return;
          }
          const file = e.dataTransfer.files[0];
          if (file) readFile(file);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 text-center",
          confirmed ? "border-border bg-paper" : "border-border/60 bg-muted/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-3">
          <ImageUp className="size-8 text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{t("step.photo.dragHint")}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={openPicker} className="tap-safe">
              {t("step.photo.choose")}
            </Button>
            <Button type="button" variant="outline" onClick={openPicker} className="tap-safe">
              <Camera className="mr-2 size-4" aria-hidden="true" />
              {t("step.photo.take")}
            </Button>
          </div>
        </div>

        {progress !== null ? (
          <div className="mt-4" role="status" aria-live="polite">
            <Progress value={progress} />
            <p className="mt-2 text-xs text-muted-foreground">
              {t("step.photo.uploading", { percent: progress })}
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <Alert variant="destructive" role="alert">
          <AlertTriangle className="size-4" aria-hidden="true" />
          <AlertTitle>{t("step.photo.errorTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section aria-labelledby="samples-heading">
        <h3 id="samples-heading" className="text-sm font-semibold">
          {t("step.photo.samplesHeading")}
        </h3>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {samplePhotos.map((sample) => (
            <li key={sample.id}>
              <button
                type="button"
                onClick={() => {
                  update({
                    photo: {
                      dataUrl: sample.src,
                      sampleId: sample.id,
                      fileName: null,
                      widthPx: sample.widthPx,
                      heightPx: sample.heightPx,
                    },
                    title: sample.label,
                    message: draft.message || sample.suggestedMessage,
                    styleId: "original",
                    styleJobStatus: "complete",
                    artworkRenders: {},
                    imageRotation: 0,
                  });
                  toast.success(t("step.photo.toast.sampleAdded"));
                }}
                className={cn(
                  "group w-full overflow-hidden rounded-lg border-2 text-left",
                  draft.photo?.sampleId === sample.id ? "border-primary" : "border-transparent",
                )}
              >
                <img
                  src={sample.src}
                  alt={sample.label}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                />
                <span className="block px-1 py-1.5 text-xs text-muted-foreground">
                  {sample.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {photo ? (
        <section aria-labelledby="chosen-heading" className="rounded-xl border border-border bg-card p-4">
          <h3 id="chosen-heading" className="text-sm font-semibold">
            {t("step.photo.chosenHeading")}
          </h3>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row">
            <img
              src={photo.dataUrl ?? ""}
              alt="Selected photo preview"
              className="h-40 w-full rounded-lg object-cover sm:w-40"
              style={{ transform: `rotate(${draft.imageRotation ?? 0}deg)` }}
            />
            <div className="flex-1 space-y-3 text-sm">
              <p className="text-muted-foreground">
                {t("step.photo.dimensions", { width: photo.widthPx, height: photo.heightPx })}
                {photo.fileName ? ` · ${photo.fileName}` : ` · ${t("step.photo.sampleLabel")}`}
              </p>
              {lowRes ? (
                <Alert>
                  <AlertTriangle className="size-4" aria-hidden="true" />
                  <AlertTitle>{t("step.photo.lowResTitle")}</AlertTitle>
                  <AlertDescription>{t("step.photo.lowResDesc")}</AlertDescription>
                </Alert>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="tap-safe"
                  onClick={() =>
                    update({
                      imageRotation: (((draft.imageRotation ?? 0) + 90) % 360) as
                        | 0
                        | 90
                        | 180
                        | 270,
                    })
                  }
                >
                  <RotateCcw className="mr-2 size-4" aria-hidden="true" />
                  {t("step.photo.rotate")}
                </Button>
                <Button type="button" variant="outline" size="sm" className="tap-safe" onClick={openPicker}>
                  {t("step.photo.replace")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="tap-safe"
                  onClick={() => update({ photo: null, styleId: "original", artworkRenders: {} })}
                >
                  <X className="mr-2 size-4" aria-hidden="true" />
                  {t("step.photo.remove")}
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <p className="rounded-lg bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">
        {t("step.photo.privacyNotice")}{" "}
        <Link to="/privacy" className="underline underline-offset-2">
          {t("step.photo.privacyLink")}
        </Link>
        .
      </p>
    </div>
  );
}
