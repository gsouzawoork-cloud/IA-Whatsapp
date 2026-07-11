import { describe, expect, it } from "vitest";
import type { Product } from "@/modules/catalog/types";
import type { Order } from "../types";
import { validateOrderForConfirmation } from "./validation";

const products: Product[] = [
  {
    id: "p1",
    categoryId: "cat",
    name: "Pizza Marguerita",
    priceCents: 4790,
    active: true,
    availability: { mode: "always_available" },
  },
  {
    id: "p2",
    categoryId: "cat",
    name: "Coca-Cola 2L",
    priceCents: 1400,
    active: true,
    availability: { mode: "quantity", quantity: 0 },
  },
];

function baseOrder(overrides: Partial<Order>): Order {
  return {
    id: "o1",
    number: "#1",
    customerId: "c1",
    status: "draft",
    fulfillment: "delivery",
    items: [
      { id: "i1", productId: "p1", productName: "Pizza Marguerita", quantity: 1, unitPriceCents: 4790 },
    ],
    address: { street: "Rua A", number: "10", district: "Centro", city: "SP" },
    payment: { method: "pix_simulated", status: "awaiting" },
    deliveryFeeCents: 700,
    availabilityApplied: false,
    createdAt: "2026-07-11T20:00:00-03:00",
    timeline: [],
    ...overrides,
  };
}

describe("validateOrderForConfirmation", () => {
  it("bloqueia pedido sem itens", () => {
    expect(validateOrderForConfirmation(baseOrder({ items: [] }), products).ok).toBe(false);
  });

  it("bloqueia entrega sem endereço", () => {
    expect(
      validateOrderForConfirmation(baseOrder({ address: undefined }), products).ok,
    ).toBe(false);
  });

  it("bloqueia pedido sem forma de pagamento", () => {
    expect(
      validateOrderForConfirmation(
        baseOrder({ payment: { method: "pix_simulated", status: "not_started" } }),
        products,
      ).ok,
    ).toBe(false);
  });

  it("bloqueia item indisponível", () => {
    const order = baseOrder({
      items: [
        { id: "i2", productId: "p2", productName: "Coca-Cola 2L", quantity: 1, unitPriceCents: 1400 },
      ],
    });
    expect(validateOrderForConfirmation(order, products).ok).toBe(false);
  });

  it("aceita pedido válido", () => {
    expect(validateOrderForConfirmation(baseOrder({}), products).ok).toBe(true);
  });

  it("aceita retirada sem endereço", () => {
    const order = baseOrder({ fulfillment: "pickup", address: undefined, deliveryFeeCents: 0 });
    expect(validateOrderForConfirmation(order, products).ok).toBe(true);
  });
});
