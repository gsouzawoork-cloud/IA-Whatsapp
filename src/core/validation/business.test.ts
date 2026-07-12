import { describe, expect, it } from "vitest";
import { createProductSchema, createZoneSchema } from "./business";

describe("normalização e validação de negócio", () => {
  it("converte preço em reais (vírgula) para centavos", () => {
    const r = createProductSchema.parse({ name: "Pizza", priceCents: "49,90" });
    expect(r.priceCents).toBe(4990);
  });

  it("converte preço com milhar e centavos", () => {
    const r = createProductSchema.parse({ name: "Combo", priceCents: "1.234,50" });
    expect(r.priceCents).toBe(123450);
  });

  it("rejeita produto sem nome", () => {
    expect(() => createProductSchema.parse({ name: "", priceCents: "10,00" })).toThrow();
  });

  it("normaliza lista de bairros separada por vírgula", () => {
    const r = createZoneSchema.parse({
      name: "Centro",
      neighborhoods: "Centro, Sé ,  ",
      deliveryFeeCents: "8,00",
      minimumOrderCents: "30,00",
      estimatedMinMinutes: "30",
      estimatedMaxMinutes: "50",
    });
    expect(r.neighborhoods).toEqual(["Centro", "Sé"]);
    expect(r.deliveryFeeCents).toBe(800);
    expect(r.minimumOrderCents).toBe(3000);
  });
});
