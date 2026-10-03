import familyPhoto from "@/assets/sample-family.jpg";
import petWatercolor from "@/assets/sample-pet-watercolor.jpg";
import framedPrint from "@/assets/sample-framed-print.jpg";
import coupleImpressionist from "@/assets/sample-couple-impressionist.jpg";
import type { Order, Person } from "./entities/types";

/** Development-only sample media. Never customer files. */
export const sampleImages = {
  family: familyPhoto,
  pet: petWatercolor,
  framed: framedPrint,
  couple: coupleImpressionist,
};

export interface SamplePhoto {
  id: string;
  label: string;
  category: "people" | "pets" | "places";
  src: string;
  widthPx: number;
  heightPx: number;
  suggestedMessage: string;
}

export const samplePhotos: SamplePhoto[] = [
  {
    id: "sample-family",
    label: "Grandmother and grandchild",
    category: "people",
    src: familyPhoto,
    widthPx: 1024,
    heightPx: 1024,
    suggestedMessage:
      "You have a way of making an ordinary afternoon feel like the best part of the week. Thinking of you today.",
  },
  {
    id: "sample-pet",
    label: "Golden retriever",
    category: "pets",
    src: petWatercolor,
    widthPx: 1024,
    heightPx: 1024,
    suggestedMessage:
      "Someone here misses you already. Consider this your daily reminder that you are very loved.",
  },
  {
    id: "sample-couple",
    label: "Evening walk",
    category: "people",
    src: coupleImpressionist,
    widthPx: 1024,
    heightPx: 1024,
    suggestedMessage:
      "Still my favourite person to walk nowhere in particular with. Happy anniversary.",
  },
  {
    id: "sample-coast",
    label: "Coastal morning",
    category: "places",
    src: framedPrint,
    widthPx: 1024,
    heightPx: 1024,
    suggestedMessage: "A little bit of that morning, kept for you.",
  },
];

export const galleryItems = samplePhotos.map((photo, index) => ({
  ...photo,
  styleLabel: ["Original", "Watercolor", "Impressionist", "Original"][index] ?? "Original",
}));

export const samplePeople: Person[] = [
  {
    id: "person_1",
    nickname: "Mum",
    relationship: "family",
    createdAt: "2026-03-02T10:00:00.000Z",
    retentionExpiry: "2027-09-02T10:00:00.000Z",
  },
  {
    id: "person_2",
    nickname: "Sam",
    relationship: "friend",
    createdAt: "2026-05-18T10:00:00.000Z",
    retentionExpiry: "2027-11-18T10:00:00.000Z",
  },
];

export const sampleOrders: Order[] = [
  {
    id: "ord_1042",
    number: "DS-1042",
    placedAt: "2026-09-12T09:24:00.000Z",
    currency: "USD",
    subtotalMinorUnits: 4900,
    shippingMinorUnits: 590,
    taxMinorUnits: 275,
    discountMinorUnits: 0,
    totalMinorUnits: 5765,
    status: "shipped",
    shippingSummary: "A. Hassan, Manama, Bahrain",
    estimatedArrival: "23-26 September 2026",
    trackingUrl: "https://example.com/tracking/demo",
    items: [
      {
        title: "Coastal morning",
        variantLabel: "A4 framed print, light oak",
        quantity: 1,
        unitPriceMinorUnits: 4900,
        thumbnail: framedPrint,
      },
    ],
    timeline: [
      { status: "paid", at: "2026-09-12T09:25:00.000Z", note: "Payment confirmed (test mode)." },
      { status: "submitted", at: "2026-09-12T10:02:00.000Z", note: "Sent to the print partner." },
      { status: "in-production", at: "2026-09-13T08:10:00.000Z", note: "Printing and framing." },
      { status: "shipped", at: "2026-09-15T16:40:00.000Z", note: "Handed to the carrier." },
    ],
  },
  {
    id: "ord_1039",
    number: "DS-1039",
    placedAt: "2026-08-30T18:02:00.000Z",
    currency: "USD",
    subtotalMinorUnits: 780,
    shippingMinorUnits: 590,
    taxMinorUnits: 69,
    discountMinorUnits: 0,
    totalMinorUnits: 1439,
    status: "delivered",
    shippingSummary: "L. Rahman, Jeddah, Saudi Arabia",
    estimatedArrival: "Delivered 4 September 2026",
    trackingUrl: null,
    items: [
      {
        title: "Thinking of you",
        variantLabel: "4 x 6 in postcard",
        quantity: 2,
        unitPriceMinorUnits: 390,
        thumbnail: petWatercolor,
      },
    ],
    timeline: [
      { status: "paid", at: "2026-08-30T18:03:00.000Z", note: "Payment confirmed (test mode)." },
      { status: "submitted", at: "2026-08-30T18:30:00.000Z", note: "Sent to the print partner." },
      { status: "shipped", at: "2026-09-01T11:00:00.000Z", note: "Handed to the carrier." },
      { status: "delivered", at: "2026-09-04T13:20:00.000Z", note: "Delivered." },
    ],
  },
];

export interface LibraryItem {
  id: string;
  title: string;
  kind: "card" | "print" | "draft";
  favorite: boolean;
  thumbnail: string;
  updatedAt: string;
  expiresOn: string;
}

export const sampleLibrary: LibraryItem[] = [
  {
    id: "cre_1",
    title: "Birthday for Mum",
    kind: "card",
    favorite: true,
    thumbnail: familyPhoto,
    updatedAt: "2026-09-14T09:00:00.000Z",
    expiresOn: "13 December 2026",
  },
  {
    id: "cre_2",
    title: "Coastal morning",
    kind: "print",
    favorite: false,
    thumbnail: framedPrint,
    updatedAt: "2026-09-10T09:00:00.000Z",
    expiresOn: "9 December 2026",
  },
  {
    id: "cre_3",
    title: "Untitled draft",
    kind: "draft",
    favorite: false,
    thumbnail: coupleImpressionist,
    updatedAt: "2026-09-19T09:00:00.000Z",
    expiresOn: "19 October 2026",
  },
];
