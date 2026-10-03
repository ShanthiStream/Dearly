import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cardFonts, ratios, templates, visualStyles } from "@/domain/content";
import { Loader2, Move, Palette, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import type { CreationDraft, TextPosition } from "@/domain/entities/types";
import { cn } from "@/lib/utils";
import { artworkKey } from "@/lib/art-style";

export function styleFilter(draft: CreationDraft): string {
  if (draft.styleId === "original") return "none";
  // If a high-res artwork render is already available, don't double-filter
  const key = artworkKey(draft.styleId, draft.styleIntensity);
  if (draft.artworkRenders?.[key]) return "none";

  const style = visualStyles.find((s) => s.id === draft.styleId);
  return style?.filter[draft.styleIntensity] ?? "none";
}

export function draftImageSrc(draft: CreationDraft): string | null {
  if (draft.styleId !== "original") {
    const generated = draft.artworkRenders?.[artworkKey(draft.styleId, draft.styleIntensity)];
    if (generated) return generated;
  }
  return draft.photo?.dataUrl ?? null;
}

const positionCoordinates: Record<TextPosition, { x: number; y: number }> = {
  "top-left": { x: 0.13, y: 0.14 },
  "top-center": { x: 0.5, y: 0.14 },
  "top-right": { x: 0.87, y: 0.14 },
  "middle-left": { x: 0.13, y: 0.5 },
  center: { x: 0.5, y: 0.5 },
  "middle-right": { x: 0.87, y: 0.5 },
  "bottom-left": { x: 0.13, y: 0.86 },
  "bottom-center": { x: 0.5, y: 0.86 },
  "bottom-right": { x: 0.87, y: 0.86 },
};

export function CardPreview({
  draft,
  className,
  showMessage = true,
  onTextMove,
  onImageAdjust,
  isFlipped = false,
  framed = true,
}: {
  draft: CreationDraft;
  className?: string;
  showMessage?: boolean;
  onTextMove?: (coordinates: { x: number; y: number }) => void;
  onImageAdjust?: (patch: { imageZoom?: number; imagePan?: { x: number; y: number } }) => void;
  isFlipped?: boolean;
  framed?: boolean;
}) {
  const previewRef = useRef<HTMLElement>(null);
  const ratio = ratios.find((r) => r.id === draft.ratioId) ?? ratios[0]!;
  const font = cardFonts.find((f) => f.id === draft.fontId) ?? cardFonts[0]!;
  const coordinates = draft.textCoordinates ?? positionCoordinates[draft.textPosition];
  const src = draftImageSrc(draft);
  const vertical = coordinates.y < 0.34 ? "top" : coordinates.y > 0.66 ? "bottom" : "middle";
  const horizontal = coordinates.x < 0.34 ? "left" : coordinates.x > 0.66 ? "right" : "center";
  const rotation = draft.imageRotation ?? 0;

  // Zoom & Pan state
  const zoom = Math.max(1, Math.min(3, draft.imageZoom ?? 1));
  const pan = draft.imagePan ?? { x: 0, y: 0 };
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; initialPan: { x: number; y: number } }>({
    x: 0,
    y: 0,
    initialPan: { x: 0, y: 0 },
  });
  const touchDistRef = useRef<number | null>(null);

  const foilClass =
    draft.foilColor === "gold"
      ? "foil-gold"
      : draft.foilColor === "rose-gold"
        ? "foil-rose-gold"
        : draft.foilColor === "silver"
          ? "foil-silver"
          : draft.foilColor === "noir"
            ? "foil-noir"
            : "text-white";

  // Typography font size classes
  const fontSizeClass =
    draft.fontSize === "sm"
      ? "text-xs sm:text-sm"
      : draft.fontSize === "lg"
        ? "text-base sm:text-lg"
        : draft.fontSize === "xl"
          ? "text-lg sm:text-xl"
          : draft.fontSize === "2xl"
            ? "text-xl sm:text-2xl"
            : "text-[14px] sm:text-base";

  // Text alignment
  const textAlignClass =
    draft.textAlign === "left"
      ? "text-left"
      : draft.textAlign === "right"
        ? "text-right"
        : draft.textAlign === "center"
          ? "text-center"
          : horizontal === "left"
            ? "text-left"
            : horizontal === "right"
              ? "text-right"
              : "text-center";

  function moveText(event: ReactPointerEvent<HTMLElement>) {
    if (!onTextMove || !previewRef.current) return;
    const bounds = previewRef.current.getBoundingClientRect();
    const x = Math.min(0.9, Math.max(0.1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.min(0.9, Math.max(0.1, (event.clientY - bounds.top) / bounds.height));
    onTextMove({ x, y });
  }

  // Image Drag Pan handlers
  function handleImagePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("figcaption") || (e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsPanning(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPan: { ...pan },
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleImagePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!isPanning || !onImageAdjust) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Bound panning range
    const maxOffset = 140 * (zoom - 0.7);
    const newX = Math.max(-maxOffset, Math.min(maxOffset, dragStartRef.current.initialPan.x + dx));
    const newY = Math.max(-maxOffset, Math.min(maxOffset, dragStartRef.current.initialPan.y + dy));
    onImageAdjust({ imagePan: { x: newX, y: newY } });
  }

  function handleImagePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    setIsPanning(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  // Touch Pinch-to-Zoom handlers
  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (e.touches.length === 2) {
      const t0 = e.touches[0]!;
      const t1 = e.touches[1]!;
      touchDistRef.current = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
    }
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (e.touches.length === 2 && touchDistRef.current && onImageAdjust) {
      const t0 = e.touches[0]!;
      const t1 = e.touches[1]!;
      const currentDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const ratioDist = currentDist / touchDistRef.current;
      const newZoom = Math.max(1, Math.min(3, Number((zoom * ratioDist).toFixed(2))));
      onImageAdjust({ imageZoom: newZoom });
      touchDistRef.current = currentDist;
    }
  }

  function handleTouchEnd() {
    touchDistRef.current = null;
  }

  const isPainting = draft.styleId !== "original" && draft.styleJobStatus === "processing";

  return (
    <div className="perspective-1000 w-full">
      <div
        className={cn(
          "preserve-3d relative w-full transition-transform duration-700 ease-out",
          isFlipped && "rotate-y-180",
        )}
      >
        {/* FRONT FACE */}
        <figure
          ref={previewRef}
          className={cn(
            "backface-hidden relative mx-auto w-full overflow-hidden rounded-2xl border border-white/80 bg-white p-3 shadow-xl transition-all duration-300 dark:border-white/10 dark:bg-zinc-900",
            framed && "pb-8 shadow-[0_16px_40px_-8px_rgba(40,30,20,0.14)]",
            className,
          )}
        >
          <div
            className="relative w-full overflow-hidden rounded-xl bg-muted touch-none"
            style={{ aspectRatio: String(ratio.aspect) }}
            onPointerDown={handleImagePointerDown}
            onPointerMove={handleImagePointerMove}
            onPointerUp={handleImagePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {src ? (
              <img
                src={src}
                alt={draft.title || "Your card"}
                className={cn(
                  "absolute left-1/2 top-1/2 max-w-none object-cover transition-transform duration-75 select-none",
                  rotation === 90 || rotation === 270 ? "h-auto" : "size-full",
                )}
                style={{
                  filter: styleFilter(draft),
                  transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom}) rotate(${rotation}deg)`,
                  ...(rotation === 90 || rotation === 270
                    ? { width: `${100 / ratio.aspect}%`, height: `${ratio.aspect * 100}%` }
                    : {}),
                }}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-stone-100 text-sm text-stone-400 dark:bg-zinc-800 dark:text-zinc-500">
                Tap to add your photo
              </div>
            )}

            {/* Pinch Zoom & Pan Floating Controls Overlay */}
            {src && onImageAdjust ? (
              <div className="pointer-events-auto absolute right-2.5 top-2.5 z-20 flex items-center gap-1 rounded-full border border-white/40 bg-black/40 px-2 py-1 text-white shadow-lg backdrop-blur-md dark:border-white/10">
                <button
                  type="button"
                  title="Zoom Out"
                  onClick={() => onImageAdjust({ imageZoom: Math.max(1, Number((zoom - 0.2).toFixed(1))) })}
                  className="rounded-full p-1 transition hover:bg-white/20 active:scale-90"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <span className="min-w-7 text-center text-[10px] font-bold">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  title="Zoom In"
                  onClick={() => onImageAdjust({ imageZoom: Math.min(3, Number((zoom + 0.2).toFixed(1))) })}
                  className="rounded-full p-1 transition hover:bg-white/20 active:scale-90"
                >
                  <ZoomIn className="size-3.5" />
                </button>
                {(zoom > 1 || pan.x !== 0 || pan.y !== 0) && (
                  <button
                    type="button"
                    title="Reset Pan & Zoom"
                    onClick={() => onImageAdjust({ imageZoom: 1, imagePan: { x: 0, y: 0 } })}
                    className="ml-0.5 rounded-full p-1 text-amber-300 transition hover:bg-white/20 active:scale-90"
                  >
                    <RotateCcw className="size-3" />
                  </button>
                )}
              </div>
            ) : null}

            {/* ARTWORK GENERATION: Rich In-Canvas Painting Animation */}
            {isPainting ? (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-black/40 backdrop-blur-[2px]">
                {/* Dynamic sweeping brushstrokes */}
                <div className="animate-paint-sweep pointer-events-none absolute -inset-y-12 -left-24 w-48 rounded-full bg-gradient-to-r from-amber-300/40 via-rose-300/50 to-transparent blur-md" />
                <div className="animate-paint-sweep pointer-events-none absolute -inset-y-12 left-10 w-44 rounded-full bg-gradient-to-r from-sky-400/40 via-indigo-300/40 to-transparent blur-lg [animation-delay:0.75s]" />
                <div className="animate-paint-sweep pointer-events-none absolute -inset-y-12 left-40 w-52 rounded-full bg-gradient-to-r from-emerald-300/40 via-yellow-200/50 to-transparent blur-md [animation-delay:1.4s]" />
                
                {/* Shimmer and canvas texture pulse */}
                <div className="animate-canvas-shimmer absolute inset-0 opacity-40" />

                {/* Central painterly card */}
                <div className="relative z-10 m-auto flex flex-col items-center gap-2.5 px-4 text-center">
                  <div className="animate-paint-pulse relative flex size-14 items-center justify-center rounded-2xl bg-white/95 shadow-2xl backdrop-blur-md dark:bg-zinc-800/95">
                    <Palette className="size-7 text-amber-600 dark:text-amber-400" />
                    <span className="absolute -top-1 -right-1 flex size-3.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex size-3.5 rounded-full bg-amber-500" />
                    </span>
                  </div>
                  <div className="rounded-full border border-white/50 bg-white/90 px-4 py-1.5 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-black/75">
                    <p className="text-xs font-bold tracking-wide text-stone-800 dark:text-stone-100">
                      Painting in {visualStyles.find((s) => s.id === draft.styleId)?.label ?? "Artwork"} Style…
                    </p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      Applying painterly brushwork & pigments
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {showMessage && draft.message ? (
              <>
                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-x-0 h-2/5",
                    vertical === "top" && "top-0 bg-gradient-to-b from-black/55 to-transparent",
                    vertical === "bottom" && "bottom-0 bg-gradient-to-t from-black/60 to-transparent",
                    vertical === "middle" && "inset-y-0 h-full bg-black/25",
                  )}
                />
                <figcaption
                  className={cn(
                    "absolute z-10 w-[88%] touch-none select-none",
                    onTextMove && "cursor-grab active:cursor-grabbing",
                  )}
                  style={{
                    left: `${coordinates.x * 100}%`,
                    top: `${coordinates.y * 100}%`,
                    transform: `translate(${horizontal === "left" ? "0" : horizontal === "right" ? "-100%" : "-50%"}, -50%)`,
                  }}
                  onPointerDown={(event) => {
                    if (!onTextMove) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    moveText(event);
                  }}
                  onPointerMove={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) moveText(event);
                  }}
                >
                  <p
                    className={cn(
                      "w-full whitespace-pre-line text-pretty leading-snug transition-all",
                      fontSizeClass,
                      textAlignClass,
                      draft.isBold && "font-bold",
                      draft.isItalic && "italic",
                      draft.isUnderline && "underline underline-offset-4",
                      foilClass,
                    )}
                    style={{
                      fontFamily: font.family,
                      letterSpacing: font.letterSpacing,
                    }}
                  >
                    {draft.message}
                  </p>
                  {onTextMove ? <span className="sr-only">Drag to move the message</span> : null}
                </figcaption>
              </>
            ) : null}
          </div>

          {/* Polaroid Brand Hallmark */}
          {framed ? (
            <div className="mt-3 flex items-center justify-center">
              <span className="font-serif text-[15px] font-medium tracking-widest text-stone-400/90 dark:text-stone-500">
                Dearly
              </span>
            </div>
          ) : null}
        </figure>

        {/* BACK FACE (Postcard Reverse) */}
        <div
          className={cn(
            "backface-hidden rotate-y-180 absolute inset-0 rounded-2xl border border-white/80 bg-[#FAF7F2] p-6 shadow-xl dark:border-white/10 dark:bg-zinc-900",
            className,
          )}
          style={{ aspectRatio: String(ratio.aspect) }}
        >
          <div className="flex h-full flex-col justify-between">
            {/* Top row: Postal stamp & Postcard title */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-3 dark:border-zinc-800">
              <div>
                <span className="font-serif text-lg font-bold tracking-tight text-stone-800 dark:text-stone-100">
                  Dearly Studio
                </span>
                <p className="text-[11px] text-stone-400 uppercase tracking-widest">Original Keepsake</p>
              </div>
              <div className="flex size-12 flex-col items-center justify-center rounded-sm border-2 border-dashed border-stone-300 bg-stone-50 p-1 text-center dark:border-zinc-700 dark:bg-zinc-800">
                <span className="text-[9px] font-semibold text-stone-500">DEARLY</span>
                <span className="text-xs">🤍</span>
              </div>
            </div>

            {/* Middle: Dedication and Recipient */}
            <div className="my-auto grid grid-cols-2 gap-4 py-4 text-left">
              <div className="border-r border-stone-200 pr-3 dark:border-zinc-800">
                <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Dedication</p>
                <p
                  className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-stone-200"
                  style={{ fontFamily: '"Caveat", cursive', fontSize: "1.15rem" }}
                >
                  {draft.dedication || draft.message || "Printed with timeless memories."}
                </p>
              </div>
              <div className="space-y-3 pl-1 text-xs text-stone-500 dark:text-stone-400">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Recipient</p>
                  <p className="font-medium text-stone-800 dark:text-stone-200">
                    {draft.recipientNickname || "Someone Special"}
                  </p>
                </div>
                <div className="border-b border-stone-200 pb-1 dark:border-zinc-800">
                  <p className="text-[10px] text-stone-400 uppercase">Occasion</p>
                  <p className="capitalize text-stone-600 dark:text-stone-300">
                    {draft.occasion !== "unspecified" ? draft.occasion.replace(/-/g, " ") : "Special Moment"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom hallmark */}
            <div className="border-t border-stone-200 pt-2 text-center text-[11px] text-stone-400 dark:border-zinc-800">
              Preserved with love • dearly.studio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
