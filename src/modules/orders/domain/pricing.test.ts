import { describe, expect, it } from "vitest";
import type { OrderItem } from "../types";
import {
  calculateDeliveryFee,
  calculateOrderSubtotal,
  calculateOrderTotal,
} from "./pricing";

const items: OrderItem[] = [
  { id: "i1", productId: "p1", productName: "Pizza", quantity: 2, unitPriceCents: 4790 },
  { id: "i2", productId: "p2", productName: "Coca", quantity: 1, unitPriceCents: 700 },
];

describe("cálculos de pedido", () => {
  it("calcula o subtotal como soma de preço × quantidade", () => {
    expect(calculateOrderSubtotal(items)).toBe(4790 * 2 + 700);
  });

  it("subtotal de pedido sem itens é zero", () => {
    expect(calculateOrderSubtotal([])).toBe(0);
  });

  it("aplica taxa de entrega apenas para entrega", () => {
    expect(calculateDeliveryFee("delivery", 700)).toBe(700);
    expect(calculateDeliveryFee("pickup", 700)).toBe(0);
  });

  it("calcula o total como subtotal + taxa", () => {
    expect(calculateOrderTotal(items, 700)).toBe(4790 * 2 + 700 + 700);
  });
});
