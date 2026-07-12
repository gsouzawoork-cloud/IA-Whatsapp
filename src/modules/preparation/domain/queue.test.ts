import { describe, expect, it } from "vitest";
import type { Order } from "@/modules/orders/types";
import {
  calculateEstimatedPreparationTime,
  getPreparationQueue,
} from "./queue";

describe("calculateEstimatedPreparationTime", () => {
  it("é determinística: tempo base + pedidos ativos + itens", () => {
    const minutes = calculateEstimatedPreparationTime({
      basePreparationMinutes: 30,
      activeOrders: 3,
      itemCount: 4,
    });
    // 30 + 3*4 + 4*2 = 50
    expect(minutes).toBe(50);
  });

  it("ignora valores negativos", () => {
    const minutes = calculateEstimatedPreparationTime({
      basePreparationMinutes: 30,
      activeOrders: -5,
      itemCount: -2,
    });
    expect(minutes).toBe(30);
  });
});

function order(id: string, status: Order["status"]): Order {
  return {
    id,
    number: id,
    customerId: "c1",
    status,
    fulfillment: "delivery",
    items: [],
    payment: { method: "pix_simulated", status: "paid" },
    deliveryFeeCents: 0,
    availabilityApplied: true,
    createdAt: "2026-07-11T20:00:00-03:00",
    timeline: [],
  };
}

describe("getPreparationQueue", () => {
  it("agrupa apenas pedidos da fila por status", () => {
    const queue = getPreparationQueue([
      order("a", "confirmed"),
      order("b", "preparing"),
      order("c", "delivered"),
      order("d", "ready"),
    ]);
    expect(queue.confirmed.map((o) => o.id)).toEqual(["a"]);
    expect(queue.preparing.map((o) => o.id)).toEqual(["b"]);
    expect(queue.ready.map((o) => o.id)).toEqual(["d"]);
    expect(queue.out_for_delivery).toEqual([]);
  });
});
