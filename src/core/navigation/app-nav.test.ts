import { describe, expect, it } from "vitest";
import { navItemsForModules } from "./app-nav";

describe("navegação derivada dos módulos", () => {
  it("empresa de serviços não vê produtos, entrega nem fila", () => {
    const items = navItemsForModules(["conversations", "customers", "agent_configuration"]);
    const hrefs = items.map((i) => i.href);
    expect(hrefs).toContain("/app");
    expect(hrefs).toContain("/app/atendimento");
    expect(hrefs).not.toContain("/app/produtos");
    expect(hrefs).not.toContain("/app/entrega");
    expect(hrefs).not.toContain("/app/fila");
  });

  it("alimentação vê produtos, entrega e fila", () => {
    const items = navItemsForModules([
      "conversations",
      "customers",
      "catalog",
      "orders",
      "preparation_queue",
      "delivery",
      "agent_configuration",
    ]);
    const hrefs = items.map((i) => i.href);
    expect(hrefs).toContain("/app/produtos");
    expect(hrefs).toContain("/app/entrega");
    expect(hrefs).toContain("/app/fila");
  });

  it("itens de núcleo (empresa) aparecem sempre", () => {
    const items = navItemsForModules([]);
    const hrefs = items.map((i) => i.href);
    expect(hrefs).toContain("/app/configuracoes/empresa");
    expect(hrefs).toContain("/app/configuracoes/unidades");
  });
});
