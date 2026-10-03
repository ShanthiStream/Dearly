import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Sparkles,
  Camera,
  Check,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import {
  OCCASION_CATEGORIES,
  OCCASION_IMAGES,
  type OccasionImageItem,
} from "@/domain/occasion-images";
import { cn } from "@/lib/utils";

interface OccasionImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (photo: OccasionImageItem) => void;
  onUploadCustomPhoto: () => void;
  currentPhotoUrl?: string | null | undefined;
}

export function OccasionImagePickerModal({
  isOpen,
  onClose,
  onSelectPhoto,
  onUploadCustomPhoto,
  currentPhotoUrl,
}: OccasionImagePickerModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPhotos = useMemo(() => {
    let list = OCCASION_IMAGES;

    if (selectedCategory !== "all") {
      list = list.filter((item) => item.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          item.credit.toLowerCase().includes(q),
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Glass Sheet/Modal */}
      <div className="relative z-10 flex flex-col w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-3xl border border-white/40 dark:border-white/10 bg-white/95 dark:bg-stone-900/95 shadow-2xl backdrop-blur-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Grab bar on mobile */}
        <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-200/60 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300">
                <Sparkles className="size-4" />
              </span>
              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                Photos by Occasion
              </h2>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Open source & curated imagery from Unsplash and Dearly Studio
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close occasion picker"
            className="flex size-9 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 transition hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="px-5 pt-3 pb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 size-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by occasion or theme (e.g. cake, rings, puppy)..."
              className="w-full rounded-2xl border border-stone-200 bg-stone-100/80 py-2.5 pl-9 pr-8 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-amber-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 flex size-5 items-center justify-center rounded-full bg-stone-300 text-stone-600 dark:bg-stone-700 dark:text-stone-300"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Occasion Horizontal Category Pills */}
        <div className="px-5 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0 border-b border-stone-200/50 dark:border-stone-800">
          {OCCASION_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery("");
                }}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
                  isSelected
                    ? "bg-black text-white shadow-sm dark:bg-white dark:text-black"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200/70 dark:bg-stone-800 dark:text-stone-300",
                )}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Photos Grid Container */}
        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-[260px]">
          {filteredPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800">
                <Search className="size-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-stone-700 dark:text-stone-200">
                No photos found
              </p>
              <p className="mt-1 text-xs text-stone-400 max-w-xs">
                Try searching another occasion like &quot;birthday&quot;, &quot;roses&quot;, or &quot;family&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pb-4">
              {filteredPhotos.map((photo) => {
                const isCurrent = currentPhotoUrl === photo.url;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => onSelectPhoto(photo)}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all hover:shadow-lg active:scale-[0.98]",
                      isCurrent
                        ? "border-amber-500 ring-2 ring-amber-500/50 shadow-md"
                        : "border-stone-200/80 dark:border-stone-800 bg-stone-100 dark:bg-stone-800/60 shadow-sm",
                    )}
                  >
                    {/* Image Aspect ratio container */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200 dark:bg-stone-800">
                      <img
                        src={photo.thumbUrl}
                        alt={photo.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Source attribution pill */}
                      <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                        <Globe className="size-2.5" />
                        <span>{photo.source}</span>
                      </span>

                      {/* Active indicator badge */}
                      {isCurrent && (
                        <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
                          <Check className="size-3 stroke-[3]" />
                        </span>
                      )}

                      {/* Gradient overlay for readability */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 pt-6">
                        <p className="line-clamp-1 text-xs font-bold text-white drop-shadow-sm">
                          {photo.title}
                        </p>
                        <p className="line-clamp-1 text-[10px] text-stone-300 drop-shadow-sm">
                          Photo by {photo.credit}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Device Upload alternative */}
        <div className="px-5 py-3 border-t border-stone-200/60 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onUploadCustomPhoto();
            }}
            className="flex items-center gap-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 shadow-sm transition hover:bg-stone-100 active:scale-95"
          >
            <Camera className="size-3.5" />
            <span>Upload Your Own Photo</span>
          </button>

          <span className="text-[10px] text-stone-400">
            {filteredPhotos.length} photos ready
          </span>
        </div>
      </div>
    </div>
  );
}
