import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  Bold,
  Bookmark,
  Check,
  ChevronLeft,
  Download,
  Heart,
  ImageUp,
  Italic,
  Loader2,
  Menu,
  MessageSquareText,
  Palette,
  Printer,
  RotateCw,
  Share2,
  Sliders,
  Sparkles,
  Smartphone,
  Underline,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cardFonts, moods, ratios, visualStyles } from "@/domain/content";
import { samplePhotos } from "@/domain/samples";
import { styleSampleThumbnails } from "@/domain/style-thumbnails";
import { fallbackMessage, type MessageRequest } from "@/domain/services/message-writer";
import { writeMessages } from "@/lib/message-ai";
import { shareCard } from "./shareCard";
import { downloadCard } from "./exportCard";
import { CardPreview } from "./CardPreview";
import { artworkKey } from "@/lib/art-style";
import { streamImage } from "@/lib/stream-image";
import { applyClientArtStyle } from "@/lib/client-art-transform";
import { useStore } from "./creation-store";
import { OccasionImagePickerModal } from "./OccasionImagePickerModal";
import type { OccasionImageItem } from "@/domain/occasion-images";
import type { FoilColor, FontId, MoodId, OccasionId, RatioId, RecipientId, StyleId, StyleIntensity, TextFontSize } from "@/domain/entities/types";
import { cn } from "@/lib/utils";

const ACCEPTED = "image/jpeg,image/png,image/heic,image/heif,image/webp";
const MAX_BYTES = 25 * 1024 * 1024;

export type CreationStep = "photo" | "message" | "preview";

const FOIL_COLORS: Array<{ id: FoilColor; label: string; bgClass: string }> = [
  { id: "gold", label: "Gold", bgClass: "bg-gradient-to-tr from-amber-600 via-amber-300 to-yellow-100 ring-amber-400" },
  { id: "rose-gold", label: "Rose Gold", bgClass: "bg-gradient-to-tr from-rose-500 via-rose-300 to-pink-100 ring-rose-400" },
  { id: "silver", label: "Silver", bgClass: "bg-gradient-to-tr from-zinc-500 via-zinc-200 to-slate-100 ring-slate-300" },
  { id: "noir", label: "Noir", bgClass: "bg-gradient-to-tr from-black via-zinc-800 to-zinc-900 ring-zinc-700" },
];

function dataUrlToFile(dataUrl: string, fileName: string | null): File {
  const [metadata, encoded = ""] = dataUrl.split(",", 2);
  const mimeType = metadata?.match(/^data:([^;]+)/)?.[1] ?? "image/png";
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new File([bytes], fileName || "dearly-photo.png", { type: mimeType });
}

async function photoToFile(photo: { dataUrl: string | null; fileName: string | null }): Promise<File> {
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

export function QuickCreate({ homeMode = false }: { homeMode?: boolean }) {
  const { draft, updateDraft } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<CreationStep>("photo");
  const [isFlipped, setIsFlipped] = useState(false);
  const [hapticTriggered, setHapticTriggered] = useState(false);
  const [occasionPickerOpen, setOccasionPickerOpen] = useState(false);
  const [isUsingOnDeviceAI, setIsUsingOnDeviceAI] = useState(false);

  // Message creation state
  const [writing, setWriting] = useState(false);
  const [messagePrompt, setMessagePrompt] = useState(draft.memory || "");
  const [selectedTone, setSelectedTone] = useState<string>("loving");

  // Art generation state
  const [generatingArt, setGeneratingArt] = useState(false);
  const [intensitySlider, setIntensitySlider] = useState<number>(draft.styleIntensityPercent ?? 85);

  const confirmed = Boolean(draft.rightsConfirmedAt);

  function triggerHaptic(type: "light" | "medium" = "light") {
    setHapticTriggered(true);
    setTimeout(() => setHapticTriggered(false), 400);
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(type === "medium" ? 22 : 10);
      } catch {
        /* ignore */
      }
    }
  }

  function setConfirmed(checked: boolean) {
    updateDraft({ rightsConfirmedAt: checked ? new Date().toISOString() : null });
  }

  function openPicker() {
    if (!confirmed) {
      toast.error("Please confirm the photo is yours to use first.");
      return;
    }
    inputRef.current?.click();
  }

  function readFile(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error("That photo is larger than 25 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast.error("Could not read that photo.");
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = new window.Image();
      img.onload = () => {
        updateDraft({
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
        triggerHaptic("medium");
        toast.success("Photo added!");
        setStep("photo");
      };
      img.onerror = () => toast.error("Could not open that image.");
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function handleSelectOccasionPhoto(photoItem: OccasionImageItem) {
    triggerHaptic("medium");

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let finalDataUrl = photoItem.url;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 1024;
        canvas.height = img.naturalHeight || 1024;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          finalDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        }
      } catch {
        finalDataUrl = photoItem.url;
      }

      updateDraft({
        photo: {
          dataUrl: finalDataUrl,
          sampleId: photoItem.id,
          fileName: `${photoItem.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`,
          widthPx: img.naturalWidth || 1024,
          heightPx: img.naturalHeight || 1024,
        },
        title: photoItem.title,
        ...(photoItem.occasionId ? { occasion: photoItem.occasionId } : {}),
        styleId: "original",
        styleJobStatus: "complete",
        artworkRenders: {},
        imageRotation: 0,
        imageZoom: 1,
        imagePan: { x: 0, y: 0 },
      });
      toast.success(`Loaded "${photoItem.title}" photo!`);
      setOccasionPickerOpen(false);
      setStep("photo");
    };

    img.onerror = () => {
      updateDraft({
        photo: {
          dataUrl: photoItem.url,
          sampleId: photoItem.id,
          fileName: `${photoItem.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`,
          widthPx: 1024,
          heightPx: 1024,
        },
        title: photoItem.title,
        ...(photoItem.occasionId ? { occasion: photoItem.occasionId } : {}),
        styleId: "original",
        styleJobStatus: "complete",
        artworkRenders: {},
        imageRotation: 0,
        imageZoom: 1,
        imagePan: { x: 0, y: 0 },
      });
      toast.success(`Loaded "${photoItem.title}" photo!`);
      setOccasionPickerOpen(false);
      setStep("photo");
    };

    img.src = photoItem.url;
  }

  async function handleGenerateArt() {
    if (!draft.photo) {
      toast.error("Add a photo first.");
      return;
    }
    if (draft.styleId === "original") {
      toast.info("Select an artist filter first.");
      return;
    }
    triggerHaptic("medium");
    setGeneratingArt(true);
    updateDraft({ styleJobStatus: "processing" });

    const intensity: StyleIntensity = intensitySlider <= 35 ? "low" : intensitySlider <= 75 ? "medium" : "high";
    const key = artworkKey(draft.styleId, intensity);

    try {
      const form = new FormData();
      form.set("image", await photoToFile(draft.photo));
      form.set("styleId", draft.styleId);
      form.set("intensity", intensity);
      await streamImage("/api/edit-artwork", form, (dataUrl, isFinal) => {
        if (isFinal) {
          setIsUsingOnDeviceAI(false);
          updateDraft({
            artworkRenders: { ...(draft.artworkRenders ?? {}), [key]: dataUrl },
            styleJobStatus: "complete",
          });
          toast.success("Artwork created successfully!");
        }
      });
    } catch (e) {
      // Fallback to our master canvas artistic engine
      if (draft.photo?.dataUrl) {
        try {
          setIsUsingOnDeviceAI(true);
          const clientStyled = await applyClientArtStyle(draft.photo.dataUrl, draft.styleId, intensity);
          updateDraft({
            artworkRenders: { ...(draft.artworkRenders ?? {}), [key]: clientStyled },
            styleJobStatus: "complete",
          });
          const styleLabel = visualStyles.find((s) => s.id === draft.styleId)?.label ?? "Artwork";
          toast.success(`✨ Rendered with on-device studio (${styleLabel} style)`);
          return;
        } catch {
          // continue to fallback error toast
        }
      }
      updateDraft({ styleJobStatus: "failed" });
      toast.error(e instanceof Error ? e.message : "Artwork creation failed.");
    } finally {
      setGeneratingArt(false);
    }
  }

  async function renderStyleForDraft(targetStyleId: StyleId, targetIntensity: StyleIntensity) {
    if (!draft.photo?.dataUrl || targetStyleId === "original") return;
    const targetKey = artworkKey(targetStyleId, targetIntensity);
    if (draft.artworkRenders?.[targetKey]) {
      updateDraft({ styleJobStatus: "complete" });
      return;
    }

    setGeneratingArt(true);
    updateDraft({ styleJobStatus: "processing" });
    try {
      setIsUsingOnDeviceAI(true);
      const styled = await applyClientArtStyle(draft.photo.dataUrl, targetStyleId, targetIntensity);
      updateDraft({
        artworkRenders: { ...(draft.artworkRenders ?? {}), [targetKey]: styled },
        styleJobStatus: "complete",
      });
    } catch (e) {
      console.error("Art rendering failed:", e);
      updateDraft({ styleJobStatus: "failed" });
    } finally {
      setGeneratingArt(false);
    }
  }

  async function generateAiWishes() {
    triggerHaptic("medium");
    setWriting(true);
    const request: MessageRequest = {
      recipientNickname: draft.recipientNickname?.trim() || "",
      relationship: (draft.relationship || "unspecified") as RecipientId | "unspecified",
      occasion: (draft.occasion || "unspecified") as OccasionId | "unspecified",
      mood: (selectedTone as MoodId) || "loving",
      memory: messagePrompt,
      senderName: draft.senderName?.trim() || "",
      language: draft.language || "English",
    };
    try {
      const options = await writeMessages(request);
      const chosen = options[1] ?? options[0] ?? fallbackMessage(request);
      updateDraft({ message: chosen });
      toast.success("AI wishes written!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not write AI message.");
    } finally {
      setWriting(false);
    }
  }

  function handleStylePick(styleId: StyleId) {
    triggerHaptic("light");
    const intensity: StyleIntensity = intensitySlider <= 35 ? "low" : intensitySlider <= 75 ? "medium" : "high";
    const alreadyRendered = styleId === "original" || Boolean(draft.artworkRenders?.[artworkKey(styleId, intensity)]);
    updateDraft({
      styleId,
      styleIntensity: intensity,
      styleIntensityPercent: intensitySlider,
      styleJobStatus: alreadyRendered ? "complete" : "processing",
    });
    if (!alreadyRendered && draft.photo?.dataUrl) {
      void renderStyleForDraft(styleId, intensity);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 selection:bg-amber-100 dark:bg-stone-950 dark:text-stone-100">
      {/* Container - Responsive Mobile-first with luxury Apple feel */}
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-28 pt-3 sm:px-6">
        
        {/* Apple Glass Sticky Header (No fake status bar) */}
        <header className="sticky top-2 z-30 mb-4">
          <div className="apple-glass flex h-14 items-center justify-between rounded-full px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            {step === "photo" ? (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setOccasionPickerOpen(true);
                }}
                className="flex size-10 items-center justify-center rounded-full text-stone-700 transition hover:bg-black/5 active:scale-95 dark:text-stone-300"
                aria-label="Select Photo by Occasion"
                title="Select Photo by Occasion"
              >
                <Menu className="size-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  if (step === "preview") setStep("message");
                  else if (step === "message") setStep("photo");
                }}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-stone-700 transition hover:bg-black/5 active:scale-95 dark:text-stone-300"
              >
                <ChevronLeft className="size-4" />
                <span>Back</span>
              </button>
            )}

            {/* Brand Logo */}
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300">
                <Heart className="size-3.5 fill-amber-500/20 text-amber-600" />
              </span>
              <span className="font-serif text-xl font-bold tracking-tight text-stone-900 dark:text-white">
                Dearly
              </span>
            </div>

            {/* Right Action */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                void shareCard(draft, "any");
              }}
              className="flex size-9 items-center justify-center rounded-full bg-white/70 text-stone-700 shadow-sm transition hover:bg-white active:scale-95 dark:bg-zinc-800 dark:text-stone-300"
              aria-label="Share card"
            >
              <Share2 className="size-4" />
            </button>
          </div>

          {/* Apple Segmented Step Indicator */}
          <div className="mt-3 flex justify-center">
            <nav
              aria-label="Creation Steps"
              className="apple-glass-pill flex rounded-full p-1 shadow-sm"
            >
              {(
                [
                  { id: "photo", label: "Photo" },
                  { id: "message", label: "Words" },
                  { id: "preview", label: "Preview" },
                ] as Array<{ id: CreationStep; label: string }>
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setStep(tab.id);
                  }}
                  className={cn(
                    "rounded-full px-4 py-1 text-xs font-semibold transition-all duration-200",
                    step === tab.id
                      ? "bg-black text-white shadow-sm dark:bg-white dark:text-black"
                      : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Occasion Photo Library Modal (Connected to Open-Source Providers) */}
        <OccasionImagePickerModal
          isOpen={occasionPickerOpen}
          onClose={() => setOccasionPickerOpen(false)}
          onSelectPhoto={handleSelectOccasionPhoto}
          onUploadCustomPhoto={openPicker}
          currentPhotoUrl={draft.photo?.dataUrl}
        />

        {/* ============================================================ */}
        {/* SCREEN 2: PHOTO STEP (Image Upload & AI Style Transformer)  */}
        {/* ============================================================ */}
        {step === "photo" && (
          <main className="flex-1 animate-in fade-in duration-300">
            {/* Polaroid Framed Hero Preview */}
            <div className="mx-auto max-w-xs">
              <CardPreview
                draft={draft}
                showMessage={false}
                framed={true}
                onImageAdjust={(patch) => updateDraft(patch)}
                className="overflow-hidden shadow-2xl"
              />

              {draft.photo ? (
                <div className="mt-2.5 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        updateDraft({
                          imageRotation: (((draft.imageRotation ?? 0) + 90) % 360) as 0 | 90 | 180 | 270,
                        });
                      }}
                      className="apple-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition active:scale-95 dark:text-stone-200"
                    >
                      <RotateCw className="size-3.5" />
                      <span>Rotate 90°</span>
                    </button>
                    {(draft.imageZoom && draft.imageZoom > 1) || (draft.imagePan && (draft.imagePan.x !== 0 || draft.imagePan.y !== 0)) ? (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic("light");
                          updateDraft({ imageZoom: 1, imagePan: { x: 0, y: 0 } });
                        }}
                        className="apple-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition active:scale-95 dark:text-stone-200"
                      >
                        <span>Reset Zoom & Position</span>
                      </button>
                    ) : null}
                  </div>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500">
                    Pinch to zoom • Drag photo to reposition inside canvas
                  </p>
                </div>
              ) : null}

              {/* Canvas Aspect Ratio Selector */}
              <div className="mt-3">
                <div className="flex items-center justify-between px-1 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Canvas Aspect Ratio
                  </span>
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    {ratios.find((r) => r.id === (draft.ratioId ?? "square"))?.label}
                  </span>
                </div>
                <div className="apple-glass grid grid-cols-5 gap-1 rounded-2xl p-1.5 shadow-sm">
                  {ratios.map((r) => {
                    const isSelected = (draft.ratioId ?? "square") === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic("light");
                          updateDraft({ ratioId: r.id });
                        }}
                        title={`${r.label}: ${r.note}`}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-xl py-1.5 px-1 text-center transition-all duration-200 active:scale-95",
                          isSelected
                            ? "bg-black text-white shadow-md dark:bg-white dark:text-black"
                            : "text-stone-600 hover:text-stone-900 hover:bg-black/5 dark:text-stone-400 dark:hover:text-white",
                        )}
                      >
                        {/* Visual aspect icon box */}
                        <div
                          className={cn(
                            "mb-1 rounded-[3px] border transition-all",
                            isSelected
                              ? "border-current bg-current/25"
                              : "border-stone-400 dark:border-stone-600",
                          )}
                          style={{
                            width: r.aspect >= 1 ? "18px" : `${Math.round(18 * r.aspect)}px`,
                            height: r.aspect <= 1 ? "18px" : `${Math.round(18 / r.aspect)}px`,
                          }}
                        />
                        <span className="text-[9px] font-bold leading-tight">
                          {r.id === "square"
                            ? "1:1"
                            : r.id === "story"
                              ? "9:16"
                              : r.id === "portrait"
                                ? "4:5"
                                : r.id === "postcard"
                                  ? "3:2"
                                  : "A6"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* In-device Processing Status Pill */}
              {isUsingOnDeviceAI && (
                <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-800 backdrop-blur-md dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                  <Sparkles className="size-3 text-amber-500" />
                  <span>On-Device Artistic Studio Active (Private & Offline)</span>
                </div>
              )}
            </div>

            {/* Photo Selection Controls */}
            <div className="mt-5 space-y-3">
              <div className="apple-glass rounded-2xl p-3.5">
                <label className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-stone-700 dark:text-stone-300">
                    This photo is mine to use
                    <span className="mt-0.5 block text-[11px] text-stone-400">
                      Privately processed to create your card.
                    </span>
                  </span>
                  <Switch
                    checked={confirmed}
                    onCheckedChange={(v) => setConfirmed(v === true)}
                    aria-label="Confirm photo rights"
                  />
                </label>
              </div>

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

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <Button
                  type="button"
                  onClick={openPicker}
                  className="apple-glass-pill h-12 flex-1 rounded-2xl text-xs sm:text-sm font-bold text-stone-900 shadow-sm active:scale-95 dark:text-white"
                >
                  <ImageUp className="mr-2 size-4 text-amber-600" />
                  {draft.photo ? "Upload Your Photo" : "Upload from Device"}
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setOccasionPickerOpen(true);
                  }}
                  className="apple-glass-dark h-12 flex-1 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-md active:scale-95"
                >
                  <Sparkles className="mr-2 size-4 text-amber-300" />
                  <span>Photos by Occasion</span>
                </Button>
              </div>
            </div>

            {/* AI STYLE SELECTOR Bottom Apple Glass Sheet */}
            <section className="apple-glass-sheet mt-6 rounded-3xl p-5 shadow-2xl">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-stone-300 dark:bg-zinc-700" />
              <h2 className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-stone-600 dark:text-stone-300">
                AI Style Selector
              </h2>

              {/* Horizontal Circular Style Selector Chips */}
              <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2 no-scrollbar">
                {visualStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleStylePick(style.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 shrink-0 rounded-2xl p-2 transition-all active:scale-95",
                      draft.styleId === style.id
                        ? "bg-stone-900 text-white shadow-md dark:bg-white dark:text-black"
                        : "bg-white/60 text-stone-700 hover:bg-white dark:bg-zinc-800 dark:text-stone-300",
                    )}
                  >
                    <div className="relative size-12 overflow-hidden rounded-full border-2 border-white/80 bg-stone-100 shadow-sm transition-transform duration-200 group-hover:scale-105 dark:border-white/20">
                      <img
                        src={styleSampleThumbnails[style.id]}
                        alt={style.label}
                        className="size-full object-cover"
                      />
                    </div>
                    <span className="max-w-[70px] truncate text-[10px] font-bold uppercase">
                      {style.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Overhaul Strength Slider */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                  <span>25% Subtle Touch</span>
                  <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-bold text-white shadow dark:bg-white dark:text-black">
                    {intensitySlider}%
                  </span>
                  <span>100% Full Overhaul</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={100}
                  value={intensitySlider}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setIntensitySlider(val);
                    const newIntensity: StyleIntensity = val <= 35 ? "low" : val <= 75 ? "medium" : "high";
                    updateDraft({ styleIntensityPercent: val, styleIntensity: newIntensity });
                  }}
                  onPointerUp={() => {
                    if (draft.styleId !== "original" && draft.photo?.dataUrl) {
                      const newIntensity: StyleIntensity = intensitySlider <= 35 ? "low" : intensitySlider <= 75 ? "medium" : "high";
                      void renderStyleForDraft(draft.styleId, newIntensity);
                    }
                  }}
                  className="apple-slider w-full cursor-pointer"
                />
              </div>

              {/* Generate AI Art Button & Next Step */}
              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={handleGenerateArt}
                  disabled={generatingArt}
                  className="apple-glass-dark flex h-13 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white shadow-xl transition active:scale-95 disabled:opacity-50"
                >
                  {generatingArt ? (
                    <Loader2 className="size-4 animate-spin text-amber-400" />
                  ) : (
                    <Sparkles className="size-4 text-amber-300" />
                  )}
                  <span>{generatingArt ? "TRANSFORMING ARTWORK…" : "GENERATE AI ART"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setStep("message");
                  }}
                  className="apple-glass flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl text-xs font-bold text-stone-800 transition active:scale-95 dark:text-stone-100"
                >
                  <span>Next: Write Message</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </section>
          </main>
        )}

        {/* ============================================================ */}
        {/* SCREEN 3: MESSAGE STEP (AI Smart Wishes & Typography Sheet) */}
        {/* ============================================================ */}
        {step === "message" && (
          <main className="flex-1 animate-in fade-in duration-300">
            {/* Live Framed Card Preview */}
            <div className="mx-auto max-w-xs">
              <CardPreview
                draft={draft}
                showMessage={true}
                framed={true}
                className="overflow-hidden shadow-2xl"
                onTextMove={(textCoordinates) => updateDraft({ textCoordinates })}
                onImageAdjust={(patch) => updateDraft(patch)}
              />
              <p className="mt-2 text-center text-[11px] text-stone-400">
                Drag the message anywhere on the card to place it • Pinch/drag to adjust photo
              </p>
            </div>

            {/* WISHES & TEXT Bottom Sheet */}
            <section className="apple-glass-sheet mt-4 rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-3 dark:border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-700 dark:text-stone-300">
                  Wishes & Text
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setStep("preview");
                  }}
                  className="flex size-7 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition active:scale-95 dark:bg-zinc-800 dark:text-stone-300"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* To Whom (Recipient Name & Relationship) */}
              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    To Whom (Recipient)
                  </label>
                  {draft.recipientNickname && (
                    <button
                      type="button"
                      onClick={() => updateDraft({ recipientNickname: "" })}
                      className="text-[10px] text-stone-400 hover:text-stone-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={draft.recipientNickname || ""}
                  onChange={(e) => updateDraft({ recipientNickname: e.target.value })}
                  placeholder="Enter recipient name or nickname (e.g. Mum, Alex, Darling...)"
                  className="apple-glass h-11 w-full rounded-xl px-3.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-black dark:text-stone-100"
                />

                {/* Quick Relationship Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    { label: "Partner", rel: "partner" },
                    { label: "Mum", rel: "family", name: "Mum" },
                    { label: "Dad", rel: "family", name: "Dad" },
                    { label: "Friend", rel: "friend" },
                    { label: "Child", rel: "child" },
                    { label: "Sister", rel: "family", name: "Sister" },
                    { label: "Brother", rel: "family", name: "Brother" },
                    { label: "Grandparent", rel: "grandchild", name: "Grandma" },
                    { label: "Someone Special", rel: "someone-special" },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        updateDraft({
                          relationship: chip.rel as any,
                          ...(chip.name && !draft.recipientNickname ? { recipientNickname: chip.name } : {}),
                        });
                      }}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-medium transition active:scale-95",
                        draft.relationship === chip.rel
                          ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700 font-semibold"
                          : "bg-white/60 text-stone-600 border border-stone-200 hover:bg-white dark:bg-zinc-800 dark:text-stone-300 dark:border-zinc-700",
                      )}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* From (Sender Name) */}
              <div className="mt-3">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  From (Your Name - Optional)
                </label>
                <input
                  type="text"
                  value={draft.senderName || ""}
                  onChange={(e) => updateDraft({ senderName: e.target.value })}
                  placeholder="Your name for sign-off (e.g. With love, David)"
                  className="apple-glass h-10 w-full rounded-xl px-3.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-black dark:text-stone-100"
                />
              </div>

              {/* Tone selection pills */}
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">Tone</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Loving", "Romantic", "Warm", "Witty", "Poetic", "Playful", "Formal"].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setSelectedTone(tone.toLowerCase());
                        updateDraft({ mood: tone.toLowerCase() as MoodId });
                      }}
                      className={cn(
                        "rounded-full px-3.5 py-1 text-xs font-semibold transition active:scale-95",
                        selectedTone.toLowerCase() === tone.toLowerCase()
                          ? "bg-black text-white shadow dark:bg-white dark:text-black"
                          : "border border-stone-200 bg-white/70 text-stone-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-300",
                      )}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input & AI Wish Generator */}
              <div className="mt-4 space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Message Prompt or Memory
                </label>
                <input
                  type="text"
                  value={messagePrompt}
                  onChange={(e) => setMessagePrompt(e.target.value)}
                  placeholder="Add a memory, occasion, or special wish (e.g. Happy Birthday, so proud of you!)..."
                  className="apple-glass h-11 w-full rounded-xl px-3.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-black dark:text-stone-100"
                />

                <button
                  type="button"
                  onClick={generateAiWishes}
                  disabled={writing}
                  className="apple-glass-pill flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-stone-900 shadow-sm transition active:scale-95 dark:text-white"
                >
                  {writing ? (
                    <Loader2 className="size-4 animate-spin text-amber-600" />
                  ) : (
                    <Wand2 className="size-4 text-amber-600" />
                  )}
                  <span>{writing ? "Composing message…" : "[ ✨ Generate AI Wishes ]"}</span>
                </button>
              </div>

              {/* Direct Message Editor */}
              <div className="mt-4">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Card Message
                </label>
                <textarea
                  value={draft.message}
                  onChange={(e) => updateDraft({ message: e.target.value })}
                  rows={2}
                  className="apple-glass w-full rounded-xl p-3 text-xs leading-relaxed text-stone-800 focus:outline-none focus:ring-2 focus:ring-black dark:text-stone-100"
                  placeholder="Write your personal message here..."
                />
              </div>

              {/* Comprehensive Typography Studio (Font, Size, Bold/Italic/Underline, Alignment, Foil) */}
              <div className="mt-4 space-y-3 rounded-2xl border border-stone-200/60 bg-white/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-850/50">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Typography & Styling
                  </span>
                  <span className="text-[10px] text-stone-400">Tap to style text</span>
                </div>

                {/* Font Selector Chips */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase text-stone-400">
                    Font Family
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                    {cardFonts.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic("light");
                          updateDraft({ fontId: f.id });
                        }}
                        className={cn(
                          "rounded-xl border py-1.5 px-2 text-center text-xs transition-all active:scale-95",
                          draft.fontId === f.id
                            ? "border-black bg-black text-white shadow-sm dark:border-white dark:bg-white dark:text-black"
                            : "border-stone-200/80 bg-white/70 text-stone-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-300",
                        )}
                        style={{ fontFamily: f.family }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size & Formatting Row */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Size Selector */}
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase text-stone-400">
                      Font Size
                    </label>
                    <div className="flex items-center gap-1">
                      {(["sm", "base", "lg", "xl", "2xl"] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            triggerHaptic("light");
                            updateDraft({ fontSize: sz });
                          }}
                          className={cn(
                            "flex-1 rounded-lg py-1 text-center text-xs font-semibold transition active:scale-95",
                            (draft.fontSize ?? "base") === sz
                              ? "bg-black text-white shadow dark:bg-white dark:text-black"
                              : "border border-stone-200 bg-white/60 text-stone-600 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-300",
                          )}
                        >
                          {sz === "sm" ? "S" : sz === "base" ? "M" : sz === "lg" ? "L" : sz === "xl" ? "XL" : "2XL"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Formatting & Alignment Toolbar */}
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase text-stone-400">
                      Format & Align
                    </label>
                    <div className="flex items-center gap-1">
                      {/* Bold */}
                      <button
                        type="button"
                        title="Bold"
                        onClick={() => {
                          triggerHaptic("light");
                          updateDraft({ isBold: !draft.isBold });
                        }}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg border text-xs font-bold transition active:scale-95",
                          draft.isBold
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-stone-200 bg-white/60 text-stone-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-300",
                        )}
                      >
                        <Bold className="size-3.5" />
                      </button>

                      {/* Italic */}
                      <button
                        type="button"
                        title="Italic"
                        onClick={() => {
                          triggerHaptic("light");
                          updateDraft({ isItalic: !draft.isItalic });
                        }}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg border text-xs italic transition active:scale-95",
                          draft.isItalic
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-stone-200 bg-white/60 text-stone-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-300",
                        )}
                      >
                        <Italic className="size-3.5" />
                      </button>

                      {/* Underline */}
                      <button
                        type="button"
                        title="Underline"
                        onClick={() => {
                          triggerHaptic("light");
                          updateDraft({ isUnderline: !draft.isUnderline });
                        }}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg border text-xs underline transition active:scale-95",
                          draft.isUnderline
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-stone-200 bg-white/60 text-stone-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-300",
                        )}
                      >
                        <Underline className="size-3.5" />
                      </button>

                      <div className="mx-1 h-5 w-px bg-stone-300 dark:bg-zinc-700" />

                      {/* Align Left */}
                      <button
                        type="button"
                        title="Align Left"
                        onClick={() => {
                          triggerHaptic("light");
                          updateDraft({ textAlign: "left" });
                        }}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg border text-xs transition active:scale-95",
                          draft.textAlign === "left"
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-stone-200 bg-white/60 text-stone-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-300",
                        )}
                      >
                        <AlignLeft className="size-3.5" />
                      </button>

                      {/* Align Center */}
                      <button
                        type="button"
                        title="Align Center"
                        onClick={() => {
                          triggerHaptic("light");
                          updateDraft({ textAlign: "center" });
                        }}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg border text-xs transition active:scale-95",
                          (draft.textAlign === "center" || !draft.textAlign)
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-stone-200 bg-white/60 text-stone-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-300",
                        )}
                      >
                        <AlignCenter className="size-3.5" />
                      </button>

                      {/* Align Right */}
                      <button
                        type="button"
                        title="Align Right"
                        onClick={() => {
                          triggerHaptic("light");
                          updateDraft({ textAlign: "right" });
                        }}
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg border text-xs transition active:scale-95",
                          draft.textAlign === "right"
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-stone-200 bg-white/60 text-stone-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-300",
                        )}
                      >
                        <AlignRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Foil Finish Swatches */}
                <div className="border-t border-stone-200/50 pt-2.5 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold uppercase text-stone-400">
                      Metallic Foil Typography
                    </label>
                    <div className="flex items-center gap-2">
                      {FOIL_COLORS.map((foil) => (
                        <button
                          key={foil.id}
                          type="button"
                          onClick={() => {
                            triggerHaptic("light");
                            updateDraft({ foilColor: foil.id });
                          }}
                          title={foil.label}
                          className={cn(
                            "size-7 rounded-full shadow transition-all active:scale-95",
                            foil.bgClass,
                            draft.foilColor === foil.id
                              ? "ring-2 ring-black ring-offset-2 dark:ring-white"
                              : "opacity-80 hover:opacity-100",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Step CTA */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    setStep("preview");
                  }}
                  className="apple-glass-dark flex h-13 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white shadow-xl transition active:scale-95"
                >
                  <span>Review & Order Print</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </section>
          </main>
        )}

        {/* ============================================================ */}
        {/* SCREEN 4: PREVIEW STEP (Review, Print & Digital Share)       */}
        {/* ============================================================ */}
        {step === "preview" && (
          <main className="flex-1 animate-in fade-in duration-300">
            {/* Elevated 3D Physical Card Display */}
            <div className="mx-auto max-w-xs">
              <CardPreview
                draft={draft}
                showMessage={true}
                framed={true}
                isFlipped={isFlipped}
                className="overflow-hidden shadow-[0_22px_55px_rgba(40,30,20,0.18)]"
                onTextMove={(textCoordinates) => updateDraft({ textCoordinates })}
                onImageAdjust={(patch) => updateDraft(patch)}
              />

              {/* Interactive Flip View Toggle */}
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    setIsFlipped(!isFlipped);
                  }}
                  className="apple-glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-stone-800 shadow-md transition hover:bg-white active:scale-95 dark:text-stone-100"
                >
                  <RotateCw className="size-3.5 text-amber-600" />
                  <span>Interactive flip view ({isFlipped ? "Back" : "Front"})</span>
                </button>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="mt-6 space-y-3">
              {/* Share Digital Card */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  void shareCard(draft, "any");
                }}
                className="apple-glass-pill flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-stone-800 shadow-sm transition hover:bg-white active:scale-95 dark:text-stone-100"
              >
                <Smartphone className="size-4 text-stone-600" />
                <span>[ 📱 Share Digital Card ]</span>
              </button>

              {/* Save Draft */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  toast.success("Draft saved to library!");
                }}
                className="apple-glass-pill flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-stone-800 shadow-sm transition hover:bg-white active:scale-95 dark:text-stone-100"
              >
                <Bookmark className="size-4 text-stone-600" />
                <span>[ 💾 Save Draft ]</span>
              </button>

              {/* Download High-Res PNG */}
              <button
                type="button"
                onClick={async () => {
                  triggerHaptic("medium");
                  try {
                    await downloadCard(draft, `${(draft.title || "dearly-card").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`);
                    toast.success("High-res PNG downloaded!");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Download failed.");
                  }
                }}
                className="apple-glass flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-xs font-semibold text-stone-700 transition hover:bg-white active:scale-95 dark:text-stone-300"
              >
                <Download className="size-4" />
                <span>Download Print-Ready PNG</span>
              </button>

              {/* Order Framed Print - Primary CTA */}
              <Link
                to="/create/full"
                onClick={() => triggerHaptic("medium")}
                className="apple-glass-dark flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-white shadow-2xl transition hover:brightness-110 active:scale-95"
              >
                <Printer className="size-5 text-amber-300" />
                <span>[ 🖼️ Order Framed Print ]</span>
              </Link>
            </div>

            {/* Haptic Feedback Indicator (Clean, no fake taskbar) */}
            <div className="mt-6 flex items-center justify-center gap-2 pb-6 text-center">
              <span
                className={cn(
                  "size-2 rounded-full transition-all duration-300",
                  hapticTriggered ? "scale-150 bg-amber-500 ring-4 ring-amber-300/50" : "bg-stone-300 dark:bg-zinc-700",
                )}
              />
              <span className="text-[11px] font-medium tracking-wide text-stone-400 dark:text-stone-500">
                Haptic Feedback Indicator
              </span>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
