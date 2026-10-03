import type { Product, ProductVariant } from "./entities/types";

/**
 * Seeded development catalog. Prices are DEMO DATA in USD minor units and are
 * not production pricing. Nothing in the UI may hardcode a price — read from here.
 */

export const CURRENCY = "USD";

export const products: Product[] = [
  {
    id: "prd_digital_card",
    slug: "digital-card",
    name: "Digital card",
    type: "digital-card",
    description: "Share on WhatsApp or by private link. Square, story or portrait.",
    active: true,
  },
  {
    id: "prd_postcard",
    slug: "postcard",
    name: "Postcard",
    type: "postcard",
    description: "4 x 6 inch printed postcard on thick matte stock.",
    active: true,
  },
  {
    id: "prd_folded_card",
    slug: "folded-card",
    name: "Folded card",
    type: "folded-card",
    description: "A6 folded card with a front, inside message and back.",
    active: true,
  },
  {
    id: "prd_photo_print",
    slug: "photo-print",
    name: "Photo print",
    type: "photo-print",
    description: "Archival photo print in several sizes, matte or lustre.",
    active: true,
  },
  {
    id: "prd_framed_print",
    slug: "framed-print",
    name: "Framed print",
    type: "framed-print",
    description: "Ready-to-hang print in a light oak or charcoal frame.",
    active: true,
  },
  {
    id: "prd_digital_download",
    slug: "print-ready-download",
    name: "Print-ready download",
    type: "digital-download",
    description: "High-resolution file you can print yourself. Nothing is shipped.",
    active: true,
  },
];

export const productVariants: ProductVariant[] = [
  {
    id: "var_digital_square",
    productId: "prd_digital_card",
    sku: "DIG-SQ",
    label: "Digital card export",
    widthMm: 0,
    heightMm: 0,
    bleedMm: 0,
    minDpi: 0,
    finish: null,
    frame: null,
    priceMinorUnits: 0,
    currency: CURRENCY,
    providerSku: "n/a",
    demoPricing: true,
  },
  {
    id: "var_postcard_4x6",
    productId: "prd_postcard",
    sku: "PC-4X6",
    label: '4 x 6 in (102 x 152 mm) postcard',
    widthMm: 152,
    heightMm: 102,
    bleedMm: 3,
    minDpi: 300,
    finish: "Matte",
    frame: null,
    priceMinorUnits: 390,
    currency: CURRENCY,
    providerSku: "MOCK-PC-4X6",
    demoPricing: true,
  },
  {
    id: "var_folded_a6",
    productId: "prd_folded_card",
    sku: "FC-A6",
    label: "A6 folded card (105 x 148 mm)",
    widthMm: 105,
    heightMm: 148,
    bleedMm: 3,
    minDpi: 300,
    finish: "Uncoated",
    frame: null,
    priceMinorUnits: 590,
    currency: CURRENCY,
    providerSku: "MOCK-FC-A6",
    demoPricing: true,
  },
  {
    id: "var_print_5x7",
    productId: "prd_photo_print",
    sku: "PP-5X7",
    label: "5 x 7 in (127 x 178 mm) photo print",
    widthMm: 127,
    heightMm: 178,
    bleedMm: 2,
    minDpi: 240,
    finish: "Lustre",
    frame: null,
    priceMinorUnits: 700,
    currency: CURRENCY,
    providerSku: "MOCK-PP-5X7",
    demoPricing: true,
  },
  {
    id: "var_print_8x10",
    productId: "prd_photo_print",
    sku: "PP-8X10",
    label: "8 x 10 in (203 x 254 mm) photo print",
    widthMm: 203,
    heightMm: 254,
    bleedMm: 2,
    minDpi: 240,
    finish: "Lustre",
    frame: null,
    priceMinorUnits: 1200,
    currency: CURRENCY,
    providerSku: "MOCK-PP-8X10",
    demoPricing: true,
  },
  {
    id: "var_print_a4",
    productId: "prd_photo_print",
    sku: "PP-A4",
    label: "A4 print (210 x 297 mm)",
    widthMm: 210,
    heightMm: 297,
    bleedMm: 3,
    minDpi: 240,
    finish: "Matte",
    frame: null,
    priceMinorUnits: 1400,
    currency: CURRENCY,
    providerSku: "MOCK-PP-A4",
    demoPricing: true,
  },
  {
    id: "var_print_square",
    productId: "prd_photo_print",
    sku: "PP-SQ21",
    label: "Square print (210 x 210 mm)",
    widthMm: 210,
    heightMm: 210,
    bleedMm: 3,
    minDpi: 240,
    finish: "Matte",
    frame: null,
    priceMinorUnits: 1300,
    currency: CURRENCY,
    providerSku: "MOCK-PP-SQ21",
    demoPricing: true,
  },
  {
    id: "var_framed_oak",
    productId: "prd_framed_print",
    sku: "FR-OAK-A4",
    label: "A4 framed print, light oak",
    widthMm: 210,
    heightMm: 297,
    bleedMm: 3,
    minDpi: 300,
    finish: "Matte",
    frame: "Light oak",
    priceMinorUnits: 4900,
    currency: CURRENCY,
    providerSku: "MOCK-FR-OAK-A4",
    demoPricing: true,
  },
  {
    id: "var_framed_charcoal",
    productId: "prd_framed_print",
    sku: "FR-CHR-A4",
    label: "A4 framed print, charcoal",
    widthMm: 210,
    heightMm: 297,
    bleedMm: 3,
    minDpi: 300,
    finish: "Matte",
    frame: "Charcoal",
    priceMinorUnits: 4900,
    currency: CURRENCY,
    providerSku: "MOCK-FR-CHR-A4",
    demoPricing: true,
  },
  {
    id: "var_download_print_ready",
    productId: "prd_digital_download",
    sku: "DL-PRINT",
    label: "Print-ready file (300 dpi)",
    widthMm: 0,
    heightMm: 0,
    bleedMm: 0,
    minDpi: 300,
    finish: null,
    frame: null,
    priceMinorUnits: 500,
    currency: CURRENCY,
    providerSku: "n/a",
    demoPricing: true,
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getVariant(id: string): ProductVariant | undefined {
  return productVariants.find((v) => v.id === id);
}

export function variantsForProduct(productId: string): ProductVariant[] {
  return productVariants.filter((v) => v.productId === productId);
}

export function fromPriceMinorUnits(productId: string): number {
  const prices = variantsForProduct(productId).map((v) => v.priceMinorUnits);
  return prices.length ? Math.min(...prices) : 0;
}

export function shippableVariants(): ProductVariant[] {
  return productVariants.filter(
    (v) => v.productId !== "prd_digital_card" && v.productId !== "prd_digital_download",
  );
}
