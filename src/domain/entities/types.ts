/**
 * Domain entities. No browser globals — reusable by future native clients
 * and by server code.
 */

export type Outcome = "card" | "print" | "both";

export type OccasionId =
  | "thinking-of-you"
  | "good-morning"
  | "birthday"
  | "thank-you"
  | "just-because"
  | "congratulations"
  | "proud-of-you";

export type RecipientId =
  | "partner"
  | "family"
  | "child"
  | "grandchild"
  | "friend"
  | "colleague"
  | "someone-special"
  | "everyone";

export type MoodId =
  | "loving"
  | "happy"
  | "funny"
  | "grateful"
  | "inspirational"
  | "romantic"
  | "peaceful"
  | "proud";

export type StyleId =
  | "original"
  | "impressionist"
  | "watercolor"
  | "pointillist"
  | "pop-art"
  | "abstract"
  | "classic-cartoon"
  | "storybook-watercolor"
  | "pop-oil"
  | "noir-vintage";

export type FoilColor = "gold" | "rose-gold" | "silver" | "noir";

export type StyleIntensity = "low" | "medium" | "high";

export type TemplateId = "warm" | "classic" | "elegant" | "playful" | "minimal";

export type RatioId = "square" | "story" | "portrait" | "postcard" | "folded";

export type FontId = "classic" | "modern" | "handwritten" | "elegant" | "bold" | "typewriter";

export type TextPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type JobStatus = "queued" | "processing" | "complete" | "failed";

export type ProductType =
  | "digital-card"
  | "postcard"
  | "folded-card"
  | "photo-print"
  | "framed-print"
  | "digital-download";

export interface Product {
  id: string;
  slug: string;
  name: string;
  type: ProductType;
  description: string;
  active: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  label: string;
  widthMm: number;
  heightMm: number;
  bleedMm: number;
  minDpi: number;
  finish: string | null;
  frame: string | null;
  priceMinorUnits: number;
  currency: string;
  providerSku: string;
  demoPricing: true;
}

export interface CartItem {
  id: string;
  creationId: string;
  variantId: string;
  quantity: number;
  unitPriceMinorUnits: number;
  crop: CropBox | null;
}

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export type OrderStatus =
  | "draft"
  | "awaiting-payment"
  | "paid"
  | "submitted"
  | "in-production"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "failed"
  | "refunded";

export interface OrderTimelineEntry {
  status: OrderStatus;
  at: string;
  note: string;
}

export interface Order {
  id: string;
  number: string;
  placedAt: string;
  currency: string;
  subtotalMinorUnits: number;
  shippingMinorUnits: number;
  taxMinorUnits: number;
  discountMinorUnits: number;
  totalMinorUnits: number;
  status: OrderStatus;
  shippingSummary: string;
  estimatedArrival: string;
  trackingUrl: string | null;
  items: Array<{
    title: string;
    variantLabel: string;
    quantity: number;
    unitPriceMinorUnits: number;
    thumbnail: string;
  }>;
  timeline: OrderTimelineEntry[];
}

/** People records are deliberately minimal — nickname + relationship only. */
export interface Person {
  id: string;
  nickname: string;
  relationship: RecipientId;
  createdAt: string;
  retentionExpiry: string;
}

export type RetentionClass =
  | "guest-24h"
  | "draft-30d"
  | "completed-90d"
  | "print-30d-post-fulfilment";

export type TextFontSize = "sm" | "base" | "lg" | "xl" | "2xl";

export interface CreationDraft {
  id: string;
  outcome: Outcome;
  title: string;
  photo: {
    dataUrl: string | null;
    sampleId: string | null;
    fileName: string | null;
    widthPx: number;
    heightPx: number;
  } | null;
  rightsConfirmedAt: string | null;
  recipientNickname: string;
  relationship: RecipientId | "unspecified";
  occasion: OccasionId | "unspecified";
  mood: MoodId | "unspecified";
  memory: string;
  senderName: string;
  language: string;
  message: string;
  styleId: StyleId;
  styleIntensity: StyleIntensity;
  styleJobStatus: JobStatus;
  artworkRenders: Record<string, string>;
  templateId: TemplateId;
  ratioId: RatioId;
  fontId: FontId;
  fontSize?: TextFontSize;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: "left" | "center" | "right";
  imageZoom?: number;
  imagePan?: { x: number; y: number };
  foilColor?: FoilColor;
  styleIntensityPercent?: number;
  textPosition: TextPosition;
  imageRotation: 0 | 90 | 180 | 270;
  textCoordinates: { x: number; y: number } | null;
  dedication: string;
  variantId: string | null;
  quantity: number;
  qualityAcknowledged: boolean;
  updatedAt: string;
  retentionClass: RetentionClass;
}
