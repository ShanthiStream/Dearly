import type { ProductVariant } from "../entities/types";

export type QualityLevel = "good" | "acceptable" | "too-low";

export interface QualityAssessment {
  level: QualityLevel;
  effectiveDpi: number;
  requiredDpi: number;
  label: string;
  advice: string;
  blocksCheckout: boolean;
  requiresAcknowledgement: boolean;
}

const MM_PER_INCH = 25.4;

export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH;
}

export function effectiveDpi(pixels: number, mm: number): number {
  if (mm <= 0) return 0;
  return Math.floor(pixels / mmToInches(mm));
}

/** Physical size including bleed, in mm. */
export function bleedSize(variant: ProductVariant): { widthMm: number; heightMm: number } {
  return {
    widthMm: variant.widthMm + variant.bleedMm * 2,
    heightMm: variant.heightMm + variant.bleedMm * 2,
  };
}

export function assessQuality(
  widthPx: number,
  heightPx: number,
  variant: ProductVariant,
): QualityAssessment {
  const bleed = bleedSize(variant);
  // Orientation-agnostic: compare the long edge to the long edge.
  const longPx = Math.max(widthPx, heightPx);
  const shortPx = Math.min(widthPx, heightPx);
  const longMm = Math.max(bleed.widthMm, bleed.heightMm);
  const shortMm = Math.min(bleed.widthMm, bleed.heightMm);

  const dpi = Math.min(effectiveDpi(longPx, longMm), effectiveDpi(shortPx, shortMm));
  const required = variant.minDpi || 300;

  if (dpi >= required) {
    return {
      level: "good",
      effectiveDpi: dpi,
      requiredDpi: required,
      label: "Good quality",
      advice: "This photo has plenty of detail for the size you picked.",
      blocksCheckout: false,
      requiresAcknowledgement: false,
    };
  }

  if (dpi >= Math.round(required * 0.66)) {
    return {
      level: "acceptable",
      effectiveDpi: dpi,
      requiredDpi: required,
      label: "Acceptable quality",
      advice:
        "This will print, but fine detail may look a little soft. Choose a smaller size for a crisper result.",
      blocksCheckout: false,
      requiresAcknowledgement: true,
    };
  }

  return {
    level: "too-low",
    effectiveDpi: dpi,
    requiredDpi: required,
    label: "Too low to print",
    advice:
      "This photo does not have enough detail for this size. Pick a smaller size or upload a larger photo.",
    blocksCheckout: true,
    requiresAcknowledgement: false,
  };
}

export function safeAreaInsetPercent(variant: ProductVariant): number {
  const bleed = bleedSize(variant);
  const shortest = Math.min(bleed.widthMm, bleed.heightMm);
  if (shortest <= 0) return 6;
  return Math.min(12, Math.max(4, ((variant.bleedMm + 4) / shortest) * 100));
}

export function describeSize(variant: ProductVariant): string {
  const wIn = (mmToInches(variant.widthMm)).toFixed(1);
  const hIn = (mmToInches(variant.heightMm)).toFixed(1);
  return `${variant.widthMm} x ${variant.heightMm} mm (${wIn} x ${hIn} in)`;
}
