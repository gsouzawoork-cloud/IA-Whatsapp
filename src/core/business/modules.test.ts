import { describe, expect, it } from "vitest";
import { defaultModulesFor, isAppModuleEnabled } from "./modules";

describe("ativação condicional de módulos por segmento", () => {
  it("serviços NÃO recebem estoque, fila de preparo nem entrega", () => {
    const mods = defaultModulesFor("services");
    expect(isAppModuleEnabled("product_availability", mods)).toBe(false);
    expect(isAppModuleEnabled("preparation_queue", mods)).toBe(false);
    expect(isAppModuleEnabled("delivery", mods)).toBe(false);
    expect(isAppModuleEnabled("catalog", mods)).toBe(false);
    // Mas sempre têm o núcleo de atendimento.
    expect(isAppModuleEnabled("conversations", mods)).toBe(true);
    expect(isAppModuleEnabled("customers", mods)).toBe(true);
  });

  it("alimentação recebe catálogo, fila de preparo e entrega", () => {
    const mods = defaultModulesFor("food_service");
    expect(isAppModuleEnabled("catalog", mods)).toBe(true);
    expect(isAppModuleEnabled("preparation_queue", mods)).toBe(true);
    expect(isAppModuleEnabled("delivery", mods)).toBe(true);
    expect(isAppModuleEnabled("orders", mods)).toBe(true);
  });

  it("varejo recebe catálogo e entrega, mas não fila de preparo", () => {
    const mods = defaultModulesFor("retail");
    expect(isAppModuleEnabled("catalog", mods)).toBe(true);
    expect(isAppModuleEnabled("delivery", mods)).toBe(true);
    expect(isAppModuleEnabled("preparation_queue", mods)).toBe(false);
  });
});
