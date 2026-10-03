import { describe, expect, it } from "vitest";
import { artworkKey, buildArtEditPrompt, isArtIntensity, isArtStyleId } from "../art-style";

describe("artist transformation requests", () => {
  it.each([
    ["impressionist", "impasto"],
    ["watercolor", "sfumato"],
    ["pointillist", "dots"],
    ["pop-art", "silkscreen"],
    ["abstract", "Cubist"],
  ] as const)("gives %s a medium-specific treatment", (style, marker) => {
    const prompt = buildArtEditPrompt(style, "medium");
    expect(prompt).toContain(marker);
    expect(prompt).toContain("recognizable identity");
    expect(prompt).toContain("not a photo with a color filter");
  });

  it("varies treatment strength without changing the artist key", () => {
    expect(buildArtEditPrompt("abstract", "low")).toContain("very close");
    expect(buildArtEditPrompt("abstract", "high")).toContain("bold and pervasive");
    expect(artworkKey("abstract", "high")).toBe("abstract:high");
  });

  it("rejects unsupported route values", () => {
    expect(isArtStyleId("original")).toBe(false);
    expect(isArtStyleId("unknown")).toBe(false);
    expect(isArtIntensity("extreme")).toBe(false);
  });
});