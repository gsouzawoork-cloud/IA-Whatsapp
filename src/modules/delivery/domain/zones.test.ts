import { describe, expect, it } from "vitest";
import type { Order } from "@/modules/orders/types";
import type { DeliveryZone } from "../types";
import {
  getDeliveryQuote,
  resolveDeliveryZone,
  resolveOrderDeliveryFee,
} from "./zones";

const zones: DeliveryZone[] = [
  {
    id: "z1",
    name: "Vila Bela",
    districts: ["Vila Bela"],
    feeCents: 600,
    etaMinMinutes: 35,
    etaMaxMinutes: 50,
    minOrderCents: 3000,
    freeAboveCents: 9000,
    active: true,
  },
  {
    id: "z2",
    name: "Centro",
    districts: ["Centro"],
    feeCents: 800,
    etaMinMinutes: 40,
    etaMaxMinutes: 55,
    minOrderCents: 3500,
    active: true,
  },
];

describe("resolveDeliveryZone", () => {
  it("resolve a zona pelo bairro, ignorando acentos e caixa", () => {
    expect(resolveDeliveryZone(zones, "vila bela")?.id).toBe("z1");
  });

  it("retorna null para bairro fora da área", () => {
    expect(resolveDeliveryZone(zones, "Bairro Distante")).toBeNull();
  });

  it("retorna null sem bairro informado", () => {
    expect(resolveDeliveryZone(zones, undefined)).toBeNull();
  });
});

describe("getDeliveryQuote", () => {
  it("aplica a taxa da zona quando abaixo do frete grátis", () => {
    const quote = getDeliveryQuote(zones[0]!, 5000);
    expect(quote.feeCents).toBe(600);
    expect(quote.freeApplied).toBe(false);
    expect(quote.meetsMinimum).toBe(true);
  });

  it("zera a taxa quando o subtotal atinge o frete grátis", () => {
    const quote = getDeliveryQuote(zones[0]!, 9000);
    expect(quote.feeCents).toBe(0);
    expect(quote.freeApplied).toBe(true);
    expect(quote.baseFeeCents).toBe(600);
  });

  it("sinaliza pedido abaixo do mínimo", () => {
    const quote = getDeliveryQuote(zones[1]!, 2000);
    expect(quote.meetsMinimum).toBe(false);
  });
});

function order(overrides: Partial<Order>): Order {
  return {
    id: "o1",
    number: "#1",
    customerId: "c1",
    status: "draft",
    fulfillment: "delivery",
    items: [
      { id: "i1", productId: "p1", productName: "Pizza", quantity: 1, unitPriceCents: 5000 },
    ],
    address: { street: "R", number: "1", district: "Vila Bela", city: "SP" },
    payment: { method: "pix_simulated", status: "awaiting" },
    deliveryFeeCents: 0,
    availabilityApplied: false,
    createdAt: "2026-07-11T20:00:00-03:00",
    timeline: [],
    ...overrides,
  };
}

describe("resolveOrderDeliveryFee", () => {
  it("retirada não tem frete", () => {
    expect(resolveOrderDeliveryFee(order({ fulfillment: "pickup" }), zones, 700)).toBe(0);
  });

  it("entrega usa a taxa da zona resolvida", () => {
    expect(resolveOrderDeliveryFee(order({}), zones, 700)).toBe(600);
  });

  it("aplica frete grátis conforme o subtotal", () => {
    const big = order({
      items: [
        { id: "i1", productId: "p1", productName: "Pizza", quantity: 2, unitPriceCents: 5000 },
      ],
    });
    expect(resolveOrderDeliveryFee(big, zones, 700)).toBe(0);
  });

  it("usa a taxa padrão quando ainda não há endereço/zona", () => {
    expect(resolveOrderDeliveryFee(order({ address: undefined }), zones, 700)).toBe(700);
  });
});
