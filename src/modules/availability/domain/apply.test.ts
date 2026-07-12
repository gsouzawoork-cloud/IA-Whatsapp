import { describe, expect, it } from "vitest";
import type { Product } from "@/modules/catalog/types";
import type { OrderItem } from "@/modules/orders/types";
import {
  applyAvailabilityOnConfirmation,
  restoreAvailabilityOnCancellation,
  setProductQuantity,
} from "./apply";

function quantityProduct(id: string, quantity: number): Product {
  return {
    id,
    categoryId: "cat",
    name: id,
    priceCents: 1000,
    active: true,
    availability: { mode: "quantity", quantity },
  };
}

const items: OrderItem[] = [
  { id: "i1", productId: "p1", productName: "p1", quantity: 3, unitPriceCents: 1000 },
];

describe("applyAvailabilityOnConfirmation", () => {
  it("desconta a quantidade na confirmação", () => {
    const result = applyAvailabilityOnConfirmation([quantityProduct("p1", 10)], items, false);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.products[0]?.availability.quantity).toBe(7);
      expect(result.value.availabilityApplied).toBe(true);
    }
  });

  it("não desconta duas vezes quando já aplicado", () => {
    const result = applyAvailabilityOnConfirmation([quantityProduct("p1", 10)], items, true);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.products[0]?.availability.quantity).toBe(10);
    }
  });

  it("não deixa a quantidade ficar negativa", () => {
    const result = applyAvailabilityOnConfirmation([quantityProduct("p1", 2)], items, false);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.products[0]?.availability.quantity).toBe(0);
    }
  });
});

describe("restoreAvailabilityOnCancellation", () => {
  it("restaura a quantidade quando havia sido aplicada", () => {
    const result = restoreAvailabilityOnCancellation([quantityProduct("p1", 7)], items, true);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.products[0]?.availability.quantity).toBe(10);
      expect(result.value.availabilityApplied).toBe(false);
    }
  });

  it("não restaura quando nunca foi aplicada", () => {
    const result = restoreAvailabilityOnCancellation([quantityProduct("p1", 7)], items, false);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.products[0]?.availability.quantity).toBe(7);
    }
  });
});

describe("setProductQuantity", () => {
  it("rejeita quantidade negativa", () => {
    expect(setProductQuantity(quantityProduct("p1", 5), -1).ok).toBe(false);
  });

  it("rejeita produto que não é por quantidade", () => {
    const manual: Product = {
      id: "p2",
      categoryId: "cat",
      name: "p2",
      priceCents: 1000,
      active: true,
      availability: { mode: "manual", manualAvailable: true },
    };
    expect(setProductQuantity(manual, 3).ok).toBe(false);
  });
});
