import { describe, expect, it } from "vitest";
import type { Product } from "../types";
import {
  canAddProductToOrder,
  getAvailableQuantity,
  getProductAlternatives,
  isProductAvailable,
} from "./availability";

function product(overrides: Partial<Product>): Product {
  return {
    id: "p1",
    categoryId: "cat",
    name: "Produto",
    priceCents: 1000,
    active: true,
    availability: { mode: "always_available" },
    ...overrides,
  };
}

describe("isProductAvailable", () => {
  it("produto sempre disponível está disponível quando ativo", () => {
    expect(isProductAvailable(product({ availability: { mode: "always_available" } }))).toBe(true);
  });

  it("produto manual indisponível não está disponível", () => {
    expect(
      isProductAvailable(product({ availability: { mode: "manual", manualAvailable: false } })),
    ).toBe(false);
  });

  it("produto com quantidade zero está indisponível", () => {
    expect(
      isProductAvailable(product({ availability: { mode: "quantity", quantity: 0 } })),
    ).toBe(false);
  });

  it("produto inativo nunca está disponível", () => {
    expect(
      isProductAvailable(product({ active: false, availability: { mode: "always_available" } })),
    ).toBe(false);
  });
});

describe("getAvailableQuantity", () => {
  it("retorna a quantidade para modo quantidade", () => {
    expect(getAvailableQuantity(product({ availability: { mode: "quantity", quantity: 5 } }))).toBe(5);
  });

  it("retorna null quando não é controlado por quantidade", () => {
    expect(getAvailableQuantity(product({ availability: { mode: "manual", manualAvailable: true } }))).toBeNull();
  });
});

describe("canAddProductToOrder", () => {
  it("bloqueia item indisponível", () => {
    const result = canAddProductToOrder(
      product({ availability: { mode: "manual", manualAvailable: false } }),
      1,
    );
    expect(result.ok).toBe(false);
  });

  it("bloqueia quando excede a quantidade disponível", () => {
    const result = canAddProductToOrder(
      product({ availability: { mode: "quantity", quantity: 2 } }),
      2,
      1,
    );
    expect(result.ok).toBe(false);
  });

  it("permite adicionar dentro da disponibilidade", () => {
    const result = canAddProductToOrder(
      product({ availability: { mode: "quantity", quantity: 5 } }),
      2,
    );
    expect(result.ok).toBe(true);
  });
});

describe("getProductAlternatives", () => {
  it("sugere apenas produtos disponíveis da mesma categoria", () => {
    const target = product({ id: "a", categoryId: "cat", availability: { mode: "manual", manualAvailable: false } });
    const available = product({ id: "b", categoryId: "cat", availability: { mode: "always_available" } });
    const other = product({ id: "c", categoryId: "outra", availability: { mode: "always_available" } });
    const unavailable = product({ id: "d", categoryId: "cat", availability: { mode: "quantity", quantity: 0 } });

    const alternatives = getProductAlternatives(target, [target, available, other, unavailable]);
    expect(alternatives.map((p) => p.id)).toEqual(["b"]);
  });
});
