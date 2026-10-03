import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { intensityLabels, visualStyles } from "@/domain/content";
import type { CreationDraft, StyleId, StyleIntensity } from "@/domain/entities/types";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/i18n";
import { artworkKey } from "@/lib/art-style";
import { ArtworkGenerator } from "../ArtworkGenerator";

const intensities: StyleIntensity[] = ["low", "medium", "high"];

export function StyleStep({
  draft,
  update,
}: {
  draft: CreationDraft;
  update: (patch: Partial<CreationDraft>) => void;
}) {
  const t = useT();
  const [compare, setCompare] = useState(50);
  const src = draft.photo?.dataUrl ?? null;
  const active = visualStyles.find((s) => s.id === draft.styleId) ?? visualStyles[0]!;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t("step.style.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("step.style.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visualStyles.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() =>
              update({
                styleId: style.id as StyleId,
                styleJobStatus:
                  style.id === "original" ||
                  Boolean(draft.artworkRenders?.[artworkKey(style.id as StyleId, draft.styleIntensity)])
                    ? "complete"
                    : "queued",
              })
            }
            aria-pressed={draft.styleId === style.id}
            className={cn(
              "overflow-hidden rounded-xl border-2 bg-card text-left",
              draft.styleId === style.id ? "border-primary" : "border-border hover:border-primary/40",
            )}
          >
            {src ? (
              <img
                src={
                  draft.artworkRenders?.[artworkKey(style.id as StyleId, draft.styleIntensity)] ?? src
                }
                alt={`${style.label} preview`}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="grid aspect-square w-full place-items-center bg-muted text-xs text-muted-foreground">
                {t("step.style.addPhotoFirst")}
              </div>
            )}
            <span className="block px-3 py-2">
              <span className="block text-sm font-semibold">{style.label}</span>
              <span className="block text-xs text-muted-foreground">{style.description}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <Label htmlFor="intensity">{t("step.style.intensityLabel")}</Label>
        <Slider
          id="intensity"
          className="mt-4"
          min={0}
          max={2}
          step={1}
          value={[intensities.indexOf(draft.styleIntensity)]}
          onValueChange={([v]) => {
            const styleIntensity = intensities[v ?? 1] ?? "medium";
            update({
              styleIntensity,
              styleJobStatus: draft.artworkRenders?.[artworkKey(draft.styleId, styleIntensity)]
                ? "complete"
                : "queued",
            });
          }}
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          {intensities.map((i) => (
            <span key={i} className={cn(draft.styleIntensity === i && "font-semibold text-foreground")}>
              {intensityLabels[i]}
            </span>
          ))}
        </div>
      </div>

      <ArtworkGenerator draft={draft} update={update} />

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("step.style.beforeAfter")}</h3>
        </div>

        {src ? (
          <>
            <div className="relative mt-3 aspect-square w-full overflow-hidden rounded-lg">
              <img src={src} alt="Original photo" className="absolute inset-0 size-full object-cover" />
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${compare}%` }}
              >
                <img
                  src={
                    draft.artworkRenders?.[artworkKey(active.id, draft.styleIntensity)] ?? src
                  }
                  alt={`${active.label} version`}
                  className="absolute inset-0 h-full w-[100vw] max-w-none object-cover"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <Label htmlFor="compare" className="mt-3 block text-xs">
              {t("step.style.slideCompare", { style: active.label })}
            </Label>
            <input
              id="compare"
              type="range"
              min={0}
              max={100}
              value={compare}
              onChange={(e) => setCompare(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{t("step.style.addPhotoCompare")}</p>
        )}
      </div>
    </div>
  );
}
