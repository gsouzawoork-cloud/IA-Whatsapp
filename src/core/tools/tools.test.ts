import { describe, expect, it } from "vitest";
import { quoteDelivery, type QuoteZone } from "./delivery/quote";
import { calculateTotals } from "./orders/calculateTotals";
import { checkAvailability, type AvailabilitySnapshot } from "./catalog/checkAvailability";
import { missingDraftFields, canTransitionOrder, createDraftInput } from "./orders/draft";
import { requestHandoff } from "./handoff/request";
import { requirePermission, validateInput } from "./context";
import { deliveryQuoteInput } from "./delivery/quote";
import type { ToolContext } from "./contracts";

const zone: QuoteZone = {
  id: "11111111-1111-1111-1111-111111111111",
  neighborhoods: ["Centro", "Sé"],
  postalCodeStart: "01000000",
  postalCodeEnd: "01099999",
  deliveryFeeCents: 800,
  minimumOrderCents: 3000,
  freeDeliveryThresholdCents: 10000,
  estimatedMinMinutes: 30,
  estimatedMaxMinutes: 50,
  isActive: true,
};

describe("delivery.quote", () => {
  it("cota entrega para bairro cadastrado", () => {
    const r = quoteDelivery([zone], { unitId: crypto.randomUUID(), neighborhood: "centro", subtotalCents: 4000 });
    expect(r.status).toBe("available");
    expect(r.feeCents).toBe(800);
    expect(r.deliveryZoneId).toBe(zone.id);
  });

  it("aplica frete grátis pela regra da zona", () => {
    const r = quoteDelivery([zone], { unitId: crypto.randomUUID(), neighborhood: "Sé", subtotalCents: 12000 });
    expect(r.freeDeliveryApplied).toBe(true);
    expect(r.feeCents).toBe(0);
  });

  it("região não cadastrada é unavailable", () => {
    const r = quoteDelivery([zone], { unitId: crypto.randomUUID(), neighborhood: "Bairro Fantasma", subtotalCents: 4000 });
    expect(r.status).toBe("unavailable");
  });

  it("sem bairro nem CEP gera manual_review", () => {
    const r = quoteDelivery([zone], { unitId: crypto.randomUUID(), subtotalCents: 4000 });
    expect(r.status).toBe("manual_review");
  });

  it("cota por faixa de CEP", () => {
    const r = quoteDelivery([zone], { unitId: crypto.randomUUID(), postalCode: "01050-000", subtotalCents: 4000 });
    expect(r.status).toBe("available");
  });
});

describe("order.calculateTotals", () => {
  it("subtotal = soma de preço × quantidade; total = subtotal + frete", () => {
    const r = calculateTotals({
      items: [
        { unitPriceCents: 4990, quantity: 2 },
        { unitPriceCents: 700, quantity: 1 },
      ],
      deliveryFeeCents: 800,
      discountTotalCents: 0,
    });
    expect(r.subtotalCents).toBe(4990 * 2 + 700);
    expect(r.totalCents).toBe(4990 * 2 + 700 + 800);
    expect(r.validationErrors).toHaveLength(0);
  });

  it("desconto > 0 é rejeitado (sem política nesta fase)", () => {
    const r = calculateTotals({
      items: [{ unitPriceCents: 1000, quantity: 1 }],
      deliveryFeeCents: 0,
      discountTotalCents: 500,
    });
    expect(r.discountTotalCents).toBe(0);
    expect(r.validationErrors.length).toBeGreaterThan(0);
  });
});

describe("catalog.checkAvailability", () => {
  const base: AvailabilitySnapshot = {
    productId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    name: "Pizza",
    category: "Pizzas",
    isActive: true,
    availabilityMode: "quantity",
    manualAvailable: true,
    quantity: 2,
  };

  it("indisponível quando quantidade pedida excede o estoque", () => {
    const r = checkAvailability(base, { productId: base.productId, quantity: 5, unitId: crypto.randomUUID() });
    expect(r.available).toBe(false);
    expect(r.availableQuantity).toBe(2);
  });

  it("sugere alternativas da mesma categoria", () => {
    const alt: AvailabilitySnapshot = { ...base, productId: crypto.randomUUID(), name: "Calabresa", availabilityMode: "always_available" };
    const target: AvailabilitySnapshot = { ...base, isActive: false };
    const r = checkAvailability(target, { productId: target.productId, quantity: 1, unitId: crypto.randomUUID() }, [alt]);
    expect(r.available).toBe(false);
    expect(r.alternatives).toHaveLength(1);
  });
});

describe("order.createDraft (regras puras)", () => {
  it("entrega exige endereço e zona", () => {
    const input = createDraftInput.parse({
      customerId: null,
      unitId: crypto.randomUUID(),
      items: [{ productId: null, productNameSnapshot: "Pizza", unitPriceSnapshotCents: 4990, quantity: 1 }],
      fulfillment: "delivery",
      deliveryAddress: null,
      deliveryZoneId: null,
    });
    expect(missingDraftFields(input)).toContain("deliveryAddress");
    expect(missingDraftFields(input)).toContain("deliveryZoneId");
  });

  it("pedido começa e só transiciona por caminhos permitidos", () => {
    expect(canTransitionOrder("draft", "pending")).toBe(true);
    expect(canTransitionOrder("draft", "delivered")).toBe(false);
    expect(canTransitionOrder("delivered", "pending")).toBe(false);
  });
});

describe("handoff.request", () => {
  it("é idempotente quando já há transferência pendente", () => {
    const r = requestHandoff({ conversationId: crypto.randomUUID(), reason: "customer_request", priority: "normal" }, true);
    expect(r.status).toBe("already_pending");
  });
});

describe("autorização e validação das ferramentas", () => {
  const agentCtx: ToolContext = {
    organizationId: crypto.randomUUID(),
    unitId: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    role: "agent",
    status: "active",
  };
  const viewerCtx: ToolContext = { ...agentCtx, role: "viewer" };

  it("viewer não pode operar pedidos (order.createDraft)", () => {
    expect(requirePermission(viewerCtx, "orders:operate")).not.toBeNull();
  });

  it("agent pode operar pedidos", () => {
    expect(requirePermission(agentCtx, "orders:operate")).toBeNull();
  });

  it("validateInput rejeita entrada malformada com erro tipado", () => {
    const r = validateInput(deliveryQuoteInput, { unitId: "not-a-uuid", subtotalCents: -1 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("invalid_input");
    }
  });
});
