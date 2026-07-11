import { describe, expect, it } from "vitest";
import {
  canTransitionOrder,
  getNextPreparationStatus,
  transitionOrderStatus,
} from "./transitions";

describe("transições de pedido", () => {
  it("permite avançar de confirmado para em preparação", () => {
    expect(canTransitionOrder("confirmed", "preparing")).toBe(true);
    expect(transitionOrderStatus("confirmed", "preparing").ok).toBe(true);
  });

  it("não permite voltar de confirmado para rascunho", () => {
    expect(canTransitionOrder("confirmed", "draft")).toBe(false);
    expect(transitionOrderStatus("confirmed", "draft").ok).toBe(false);
  });

  it("não permite voltar de entregue para preparação", () => {
    expect(canTransitionOrder("delivered", "preparing")).toBe(false);
  });

  it("pedido entregue e cancelado são terminais", () => {
    expect(canTransitionOrder("delivered", "cancelled")).toBe(false);
    expect(canTransitionOrder("cancelled", "confirmed")).toBe(false);
  });

  it("sugere o próximo status da fila conforme o tipo de entrega", () => {
    expect(getNextPreparationStatus("ready", "delivery")).toBe("out_for_delivery");
    expect(getNextPreparationStatus("ready", "pickup")).toBe("delivered");
    expect(getNextPreparationStatus("delivered", "delivery")).toBeNull();
  });
});
