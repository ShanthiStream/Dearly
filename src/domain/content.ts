import type {
  FontId,
  MoodId,
  OccasionId,
  RatioId,
  RecipientId,
  StyleId,
  StyleIntensity,
  TemplateId,
  TextPosition,
} from "./entities/types";

export const occasions: Array<{ id: OccasionId; label: string; blurb: string }> = [
  { id: "thinking-of-you", label: "Thinking of You", blurb: "A quiet hello" },
  { id: "good-morning", label: "Good Morning", blurb: "Start their day warmly" },
  { id: "birthday", label: "Birthday", blurb: "Make the day feel seen" },
  { id: "thank-you", label: "Thank You", blurb: "Say it properly" },
  { id: "just-because", label: "Just Because", blurb: "No reason needed" },
  { id: "congratulations", label: "Congratulations", blurb: "Celebrate them" },
  { id: "proud-of-you", label: "Proud of You", blurb: "Tell them plainly" },
];

export const recipients: Array<{ id: RecipientId; label: string }> = [
  { id: "partner", label: "Partner" },
  { id: "family", label: "Family" },
  { id: "child", label: "Child" },
  { id: "grandchild", label: "Grandchild" },
  { id: "friend", label: "Friend" },
  { id: "colleague", label: "Colleague" },
  { id: "someone-special", label: "Someone Special" },
  { id: "everyone", label: "Everyone" },
];

export const moods: Array<{ id: MoodId; label: string }> = [
  { id: "loving", label: "Loving" },
  { id: "happy", label: "Happy" },
  { id: "funny", label: "Funny" },
  { id: "grateful", label: "Grateful" },
  { id: "inspirational", label: "Inspirational" },
  { id: "romantic", label: "Romantic" },
  { id: "peaceful", label: "Peaceful" },
  { id: "proud", label: "Proud" },
];

export const visualStyles: Array<{
  id: StyleId;
  label: string;
  description: string;
  /** Legacy compatibility only. Artist renditions are generated server-side. */
  filter: Record<StyleIntensity, string>;
}> = [
  {
    id: "original",
    label: "Original",
    description: "Your photo, gently corrected. Nothing reinterpreted.",
    filter: { low: "none", medium: "none", high: "none" },
  },
  {
    id: "impressionist",
    label: "Van Gogh",
    description: "Post-Impressionist impasto, rhythmic strokes and expressive light.",
    filter: {
      low: "saturate(1.2) contrast(1.06) hue-rotate(-4deg)",
      medium: "saturate(1.45) contrast(1.12) hue-rotate(-8deg) blur(0.4px)",
      high: "saturate(1.75) contrast(1.2) hue-rotate(-12deg) blur(0.8px)",
    },
  },
  {
    id: "watercolor",
    label: "Da Vinci",
    description: "Renaissance drawing, translucent glazes and subtle sfumato.",
    filter: {
      low: "sepia(0.2) saturate(0.85) contrast(1.04)",
      medium: "sepia(0.45) saturate(0.65) contrast(1.1) brightness(1.04)",
      high: "sepia(0.7) saturate(0.45) contrast(1.18) brightness(1.08)",
    },
  },
  {
    id: "pointillist",
    label: "Seurat",
    description: "Optically mixed colour built from fine pointillist marks.",
    filter: {
      low: "contrast(1.1) saturate(1.15)",
      medium: "contrast(1.2) saturate(1.3)",
      high: "contrast(1.35) saturate(1.5)",
    },
  },
  {
    id: "pop-art",
    label: "Warhol",
    description: "Graphic silkscreen colour, halftone texture and bold contrast.",
    filter: {
      low: "saturate(1.4) contrast(1.15)",
      medium: "saturate(1.9) contrast(1.35)",
      high: "saturate(2.4) contrast(1.6) hue-rotate(8deg)",
    },
  },
  {
    id: "abstract",
    label: "Picasso",
    description: "Cubist planes, multiple viewpoints and angular geometry.",
    filter: {
      low: "saturate(1.2) hue-rotate(6deg)",
      medium: "saturate(1.5) hue-rotate(15deg) contrast(1.15)",
      high: "saturate(1.9) hue-rotate(28deg) contrast(1.3) blur(1px)",
    },
  },
  {
    id: "classic-cartoon",
    label: "3D Cartoon",
    description: "Playful 3D animated character styling with studio lighting and warm tones.",
    filter: {
      low: "saturate(1.3) contrast(1.1)",
      medium: "saturate(1.6) contrast(1.2) brightness(1.05)",
      high: "saturate(1.9) contrast(1.3) brightness(1.08)",
    },
  },
  {
    id: "storybook-watercolor",
    label: "Storybook",
    description: "Gentle fairytale picture-book washes with delicate paper textures.",
    filter: {
      low: "sepia(0.2) saturate(1.1) brightness(1.02)",
      medium: "sepia(0.35) saturate(1.2) contrast(1.05) brightness(1.06)",
      high: "sepia(0.5) saturate(1.3) contrast(1.12) brightness(1.1)",
    },
  },
  {
    id: "pop-oil",
    label: "Pop Oil",
    description: "Thick tactile knife strokes, vibrant saturated oils, and energetic brushwork.",
    filter: {
      low: "contrast(1.15) saturate(1.3)",
      medium: "contrast(1.3) saturate(1.6) hue-rotate(-5deg)",
      high: "contrast(1.45) saturate(1.9) hue-rotate(-10deg)",
    },
  },
  {
    id: "noir-vintage",
    label: "Vintage Noir",
    description: "Dramatic 1940s Hollywood cinema chiaroscuro with silver gelatin grain.",
    filter: {
      low: "grayscale(0.85) contrast(1.2)",
      medium: "grayscale(1) contrast(1.35) brightness(0.95)",
      high: "grayscale(1) contrast(1.5) brightness(0.9)",
    },
  },
];

export const intensityLabels: Record<StyleIntensity, string> = {
  low: "Faithful",
  medium: "Stylised",
  high: "Boldly interpreted",
};

export const templates: Array<{
  id: TemplateId;
  label: string;
  description: string;
  headingClass: string;
  bodyClass: string;
  surfaceClass: string;
}> = [
  {
    id: "warm",
    label: "Warm",
    description: "Rounded, friendly, hand-written feel.",
    headingClass: "font-serif text-primary",
    bodyClass: "font-sans",
    surfaceClass: "bg-paper",
  },
  {
    id: "classic",
    label: "Classic",
    description: "Centred and traditional.",
    headingClass: "font-serif tracking-wide",
    bodyClass: "font-sans",
    surfaceClass: "bg-card",
  },
  {
    id: "elegant",
    label: "Elegant",
    description: "Generous space, fine detail.",
    headingClass: "font-serif italic",
    bodyClass: "font-sans tracking-wide",
    surfaceClass: "bg-paper-deep",
  },
  {
    id: "playful",
    label: "Playful",
    description: "Bright and light-hearted.",
    headingClass: "font-sans font-extrabold",
    bodyClass: "font-sans",
    surfaceClass: "bg-accent",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Just the photo and a line.",
    headingClass: "font-sans font-medium tracking-tight",
    bodyClass: "font-sans",
    surfaceClass: "bg-card",
  },
];

export const ratios: Array<{
  id: RatioId;
  label: string;
  aspect: number;
  note: string;
}> = [
  { id: "square", label: "Square 1:1", aspect: 1, note: "Good for WhatsApp and Instagram" },
  { id: "story", label: "Story 9:16", aspect: 9 / 16, note: "Full-screen on a phone" },
  { id: "portrait", label: "Portrait 4:5", aspect: 4 / 5, note: "Classic card shape" },
  { id: "postcard", label: "Postcard 3:2", aspect: 3 / 2, note: "Matches the printed postcard" },
  { id: "folded", label: "Folded A6", aspect: 105 / 148, note: "Front of a folded card" },
];

export const cardFonts: Array<{
  id: FontId;
  label: string;
  /** Applied inline so the preview matches the download exactly. */
  family: string;
  weight: number;
  letterSpacing: string;
}> = [
  { id: "classic", label: "Classic", family: '"Fraunces", Georgia, serif', weight: 600, letterSpacing: "0" },
  { id: "modern", label: "Modern", family: '"Nunito Sans", system-ui, sans-serif', weight: 700, letterSpacing: "0" },
  { id: "handwritten", label: "Handwritten", family: '"Caveat", cursive', weight: 700, letterSpacing: "0" },
  { id: "elegant", label: "Elegant", family: '"Playfair Display", Georgia, serif', weight: 500, letterSpacing: "0.01em" },
  { id: "bold", label: "Bold", family: '"Bebas Neue", Impact, sans-serif', weight: 400, letterSpacing: "0.04em" },
  { id: "typewriter", label: "Typewriter", family: '"Courier New", monospace', weight: 700, letterSpacing: "0" },
];

export const textPositions: Array<{ id: TextPosition; label: string }> = [
  { id: "top-left", label: "Top left" },
  { id: "top-center", label: "Top middle" },
  { id: "top-right", label: "Top right" },
  { id: "middle-left", label: "Middle left" },
  { id: "center", label: "Middle" },
  { id: "middle-right", label: "Middle right" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-center", label: "Bottom middle" },
  { id: "bottom-right", label: "Bottom right" },
];

export const refinements = [
  "Warmer",
  "Shorter",
  "More heartfelt",
  "Gentle humor",
  "More formal",
  "Try again",
] as const;

export type Refinement = (typeof refinements)[number];

export const UPLOAD_PRIVACY_NOTICE =
  "We store your photo and card details to create, save and print what you request. Guest files are deleted after 24 hours; signed-in drafts after 30 days; completed digital files after 90 days; and print files 30 days after delivery or final refund. Account, order and tax records are kept only for the stated legal period, then deleted or anonymised. Vercel, Supabase and approved providers may process data outside Bahrain or Saudi Arabia using required transfer safeguards. We do not sell personal data, use it for targeted ads or train AI on it. You or anyone shown or named can request deletion at /privacy/request.";

export const RIGHTS_CONFIRMATION =
  "I am 13 or older. I own this photo or have permission to use it. Anyone I add to my card list is okay being listed there.";

export const faqs: Array<{ q: string; a: string }> = [
  {
    q: "Do I need an account?",
    a: "No. You can create and preview as a guest. An account only matters if you want to save work, keep a library or track orders.",
  },
  {
    q: "Is the preview really free?",
    a: "Yes. Previews are free and no card details are needed. You only pay if you order a print or a paid download.",
  },
  {
    q: "What if my photo is a bit small?",
    a: "We check the resolution against the exact product size and tell you plainly: Good, Acceptable or Too low. We block a print that would look poor.",
  },
  {
    q: "What happens to my photo?",
    a: "It is stored privately to make what you asked for, then deleted on a fixed schedule — 24 hours for guests, 30 days for saved drafts, 90 days for finished digital files.",
  },
  {
    q: "Will you crop someone's head off?",
    a: "No. You see the crop, bleed and safe area before anything is made, and we never silently crop a face or main subject.",
  },
  {
    q: "How much is shipping and how long does it take?",
    a: "Shipping and a delivery estimate are shown in the cart before payment, never as a surprise at the end.",
  },
  {
    q: "Can I just download a file and print it myself?",
    a: "Yes. The print-ready download is separate from anything we ship, and it is labelled that way throughout.",
  },
];
