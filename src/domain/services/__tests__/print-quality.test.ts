import { describe, expect, it } from "vitest";

import { getVariant } from "../../catalog";
import { assessQuality, bleedSize, effectiveDpi, mmToInches } from "../print-quality";
import type { ProductVariant } from "../../entities/types";

const print5x7 = getVariant("var_print_5x7") as ProductVariant;

describe("print quality helpers", () => {
  it("converts millimetres to inches", () => {
    expect(mmToInches(25.4)).toBeCloseTo(1);
  });

  it("computes effective dpi and guards against zero size", () => {
    expect(effectiveDpi(300, 25.4)).toBe(300);
    expect(effectiveDpi(300, 0)).toBe(0);
  });

  it("adds bleed on both edges", () => {
    const bleed = bleedSize(print5x7);
    expect(bleed.widthMm).toBe(print5x7.widthMm + print5x7.bleedMm * 2);
    expect(bleed.heightMm).toBe(print5x7.heightMm + print5x7.bleedMm * 2);
  });
});

describe("assessQuality", () => {
  it("passes a large photo", () => {
    const result = assessQuality(4000, 3000, print5x7);
    expect(result.level).toBe("good");
    expect(result.blocksCheckout).toBe(false);
  });

  it("flags a borderline photo without blocking checkout", () => {
    const result = assessQuality(1400, 1000, print5x7);
    expect(result.level).toBe("acceptable");
    expect(result.blocksCheckout).toBe(false);
    expect(result.requiresAcknowledgement).toBe(true);
  });

  it("blocks checkout for a tiny photo", () => {
    const result = assessQuality(300, 200, print5x7);
    expect(result.level).toBe("too-low");
    expect(result.blocksCheckout).toBe(true);
  });

  it("is orientation-agnostic", () => {
    expect(assessQuality(4000, 3000, print5x7).level).toBe(
      assessQuality(3000, 4000, print5x7).level,
    );
  });
});
