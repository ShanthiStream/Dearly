import type { StyleId, StyleIntensity } from "@/domain/entities/types";

export const ART_STYLE_IDS = [
  "impressionist",
  "watercolor",
  "pointillist",
  "pop-art",
  "abstract",
  "classic-cartoon",
  "storybook-watercolor",
  "pop-oil",
  "noir-vintage",
] as const satisfies readonly StyleId[];

export const ART_INTENSITIES = ["low", "medium", "high"] as const satisfies readonly StyleIntensity[];

const treatments: Record<(typeof ART_STYLE_IDS)[number], string> = {
  impressionist:
    "the recognizable visual language of Vincent van Gogh: a late-19th-century Post-Impressionist oil painting with directional impasto, rhythmic visible strokes, saturated complementary colors, expressive contours, and luminous swirling light",
  watercolor:
    "the recognizable visual language of Leonardo da Vinci: an Italian High Renaissance portrait study with fine preparatory drawing, subtle sfumato modeling, translucent oil glazes, restrained earth pigments, and anatomically precise naturalism",
  pointillist:
    "the recognizable visual language of Georges Seurat: a late-19th-century Neo-Impressionist painting built from fine, distinct dots of unmixed color, optical color blending, luminous atmosphere, and carefully structured forms",
  "pop-art":
    "the recognizable visual language of Andy Warhol: a 1960s Pop Art silkscreen print with bold flat color separations, simplified graphic shapes, high contrast, halftone texture, and deliberate screen-registration character",
  abstract:
    "the recognizable visual language of Pablo Picasso: an early-20th-century Cubist painting with the subject reconstructed into angular planes, simultaneous viewpoints, decisive geometric contours, and a controlled modernist palette",
  "classic-cartoon":
    "the recognizable visual language of a high-end 3D animated character feature: charming stylized 3D character design, glowing warm studio lighting, soft subsurface skin rendering, expressive warm eyes, and Pixar-inspired tactile charm",
  "storybook-watercolor":
    "the recognizable visual language of beloved vintage children's storybook art: dreamy fluid watercolor washes, soft feathered edges, gentle graphite outlines, warm textured paper grain, and nostalgic whimsical warmth",
  "pop-oil":
    "the recognizable visual language of vibrant pop impasto oil painting: thick tactile palette knife textures, rich glistening oils, saturated modern palette, luminous rim highlights, and expressive portrait energy",
  "noir-vintage":
    "the recognizable visual language of 1940s classic Hollywood film noir photography: dramatic chiaroscuro high-contrast lighting, deep velvety blacks, fine silver gelatin film grain, soft lens glow, and timeless glamorous cinematic presence",
};

const intensityInstructions: Record<StyleIntensity, string> = {
  low: "Keep the source composition and facial structure very close; apply the medium gently.",
  medium: "Balance clear source likeness with an unmistakable transformation in the requested medium.",
  high: "Make the artistic construction bold and pervasive while retaining recognizable identities and essential objects.",
};

export function isArtStyleId(value: string): value is (typeof ART_STYLE_IDS)[number] {
  return ART_STYLE_IDS.some((id) => id === value);
}

export function isArtIntensity(value: string): value is StyleIntensity {
  return ART_INTENSITIES.some((intensity) => intensity === value);
}

export function artworkKey(styleId: StyleId, intensity: StyleIntensity): string {
  return `${styleId}:${intensity}`;
}

export function buildArtEditPrompt(
  styleId: Exclude<StyleId, "original">,
  intensity: StyleIntensity,
): string {
  return [
    `Transform the supplied photograph into ${treatments[styleId]}.`,
    intensityInstructions[intensity],
    "Preserve every person's recognizable identity, age, expression, skin tone, pose, gaze, body proportions, and relative position.",
    "Preserve the original crop, camera viewpoint, number of people, main objects, and scene layout.",
    "Do not add or remove people, facial features, fingers, limbs, text, signatures, borders, watermarks, or frames.",
    "The result must be a complete polished artwork, not a photo with a color filter applied.",
  ].join(" ");
}