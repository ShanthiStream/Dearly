import { describe, expect, it } from "vitest";

import { formatMoney, priceCart, SHIPPING_FLAT_MINOR_UNITS, TAX_RATE } from "../pricing";
import type { CartItem } from "../../entities/types";

function item(partial: Partial<CartItem> & Pick<CartItem, "variantId">): CartItem {
  return {
    id: `ci_${partial.variantId}`,
    ...partial,
    quantity: partial.quantity ?? 1,
    unitPriceMinorUnits: partial.unitPriceMinorUnits ?? 1000,
  } as CartItem;
}

describe("priceCart", () => {
  it("returns an empty breakdown for an empty cart", () => {
    const result = priceCart([]);
    expect(result.subtotal).toBe(0);
    expect(result.shipping).toBe(0);
    expect(result.total).toBe(0);
    expect(result.hasShippable).toBe(false);
  });

  it("does not charge shipping for digital-only carts", () => {
    const result = priceCart([item({ variantId: "var_digital_square", unitPriceMinorUnits: 200 })]);
    expect(result.hasShippable).toBe(false);
    expect(result.shipping).toBe(0);
    expect(result.total).toBe(200 + Math.round(200 * TAX_RATE));
  });

  it("charges flat shipping once when a physical item is present", () => {
    const result = priceCart([
      item({ variantId: "var_print_5x7", unitPriceMinorUnits: 700, quantity: 2 }),
      item({ variantId: "var_postcard_4x6", unitPriceMinorUnits: 590 }),
    ]);
    expect(result.hasShippable).toBe(true);
    expect(result.shipping).toBe(SHIPPING_FLAT_MINOR_UNITS);
    expect(result.subtotal).toBe(700 * 2 + 590);
  });

  it("applies a known promo code and ignores unknown ones", () => {
    const cart = [item({ variantId: "var_print_5x7", unitPriceMinorUnits: 1000 })];
    expect(priceCart(cart, "dearly10").discount).toBe(100);
    expect(priceCart(cart, "NOPE").discount).toBe(0);
  });

  it("never produces a negative total", () => {
    const result = priceCart([item({ variantId: "var_digital_square", unitPriceMinorUnits: 0 })], "DEARLY10");
    expect(result.total).toBeGreaterThanOrEqual(0);
  });
});

describe("formatMoney", () => {
  it("formats minor units as currency", () => {
    expect(formatMoney(1590)).toBe("$15.90");
  });
});
