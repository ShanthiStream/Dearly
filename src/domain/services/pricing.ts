import { getVariant } from "../catalog";
import type { CartItem } from "../entities/types";

export const SHIPPING_FLAT_MINOR_UNITS = 590;
export const TAX_RATE = 0.05;

export function formatMoney(minorUnits: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(minorUnits / 100);
}

export interface PriceBreakdown {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  hasShippable: boolean;
}

export const promoCodes: Record<string, { label: string; percentOff: number }> = {
  DEARLY10: { label: "10% off (demo code)", percentOff: 10 },
};

export function priceCart(items: CartItem[], promoCode?: string | null): PriceBreakdown {
  const subtotal = items.reduce((sum, item) => sum + item.unitPriceMinorUnits * item.quantity, 0);

  const promo = promoCode ? promoCodes[promoCode.toUpperCase()] : undefined;
  const discount = promo ? Math.round((subtotal * promo.percentOff) / 100) : 0;

  const hasShippable = items.some((item) => {
    const variant = getVariant(item.variantId);
    return Boolean(variant && variant.providerSku !== "n/a");
  });

  const shipping = hasShippable && subtotal > 0 ? SHIPPING_FLAT_MINOR_UNITS : 0;
  const taxable = Math.max(subtotal - discount, 0) + shipping;
  const tax = Math.round(taxable * TAX_RATE);

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: Math.max(subtotal - discount, 0) + shipping + tax,
    hasShippable,
  };
}

/** Entitlements are configurable, never hardcoded in the UI. */
export const entitlements = {
  freePreviews: "unlimited" as const,
  freeSignedInDigitalExportsPerWeek: 1,
  paidDigitalExportMinorUnits: 200,
  guestCanDownloadWatermarkedPreview: true,
};
