import { describe, expect, it } from "vitest";
import { calculateChange, validatePaymentDetails } from "./payments";

describe("calculateChange", () => {
  it("calcula o troco quando o valor cobre o total", () => {
    const result = calculateChange(9580, 10000);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(420);
    }
  });

  it("rejeita valor menor que o total", () => {
    expect(calculateChange(9580, 5000).ok).toBe(false);
  });
});

describe("validatePaymentDetails", () => {
  it("exige bandeira do cartão na entrega", () => {
    expect(
      validatePaymentDetails({ method: "card_on_delivery", status: "pay_on_delivery" }, 5000).ok,
    ).toBe(false);
  });

  it("aceita cartão na entrega com crédito", () => {
    expect(
      validatePaymentDetails(
        { method: "card_on_delivery", status: "pay_on_delivery", cardKind: "credit" },
        5000,
      ).ok,
    ).toBe(true);
  });

  it("rejeita dinheiro abaixo do total", () => {
    expect(
      validatePaymentDetails(
        { method: "cash_on_delivery", status: "pay_on_delivery", cashGivenCents: 3000 },
        5000,
      ).ok,
    ).toBe(false);
  });

  it("calcula o troco no dinheiro válido", () => {
    const result = validatePaymentDetails(
      { method: "cash_on_delivery", status: "pay_on_delivery", cashGivenCents: 6000 },
      5000,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.changeCents).toBe(1000);
    }
  });

  it("aceita Pix simulado", () => {
    expect(validatePaymentDetails({ method: "pix_simulated", status: "awaiting" }, 5000).ok).toBe(true);
  });
});
