import { describe, expect, it } from "vitest";
import { ROLES, type Role } from "./roles";
import {
  can,
  canManageAgent,
  canManageCatalog,
  canManageDelivery,
  canManageMembers,
  canManageOrganization,
  canOperateOrders,
  canTransferOrganization,
  canViewAuditLogs,
  type AuthzContext,
} from "./authorize";

const active = (role: Role): AuthzContext => ({ role, status: "active" });

describe("matriz de permissões por papel", () => {
  it("owner pode tudo, incluindo transferir a propriedade", () => {
    const c = active("owner");
    expect(canManageOrganization(c)).toBe(true);
    expect(canTransferOrganization(c)).toBe(true);
    expect(canManageMembers(c)).toBe(true);
    expect(canManageAgent(c)).toBe(true);
    expect(canViewAuditLogs(c)).toBe(true);
  });

  it("admin gerencia tudo, exceto transferir a propriedade", () => {
    const c = active("admin");
    expect(canManageOrganization(c)).toBe(true);
    expect(canTransferOrganization(c)).toBe(false);
    expect(canManageMembers(c)).toBe(true);
  });

  it("manager gerencia catálogo e entrega, mas não membros nem agente", () => {
    const c = active("manager");
    expect(canManageCatalog(c)).toBe(true);
    expect(canManageDelivery(c)).toBe(true);
    expect(canOperateOrders(c)).toBe(true);
    expect(canManageMembers(c)).toBe(false);
    expect(canManageAgent(c)).toBe(false);
    expect(canManageOrganization(c)).toBe(false);
  });

  it("agent opera atendimento, mas não altera preço/entrega/IA", () => {
    const c = active("agent");
    expect(canOperateOrders(c)).toBe(true);
    expect(canManageCatalog(c)).toBe(false);
    expect(canManageDelivery(c)).toBe(false);
    expect(canManageAgent(c)).toBe(false);
  });

  it("viewer é somente leitura: nenhuma operação/gestão", () => {
    const c = active("viewer");
    expect(canOperateOrders(c)).toBe(false);
    expect(canManageCatalog(c)).toBe(false);
    expect(canViewAuditLogs(c)).toBe(false);
  });

  it("usuário suspenso perde toda permissão, mesmo sendo owner", () => {
    const suspended: AuthzContext = { role: "owner", status: "suspended" };
    expect(canManageOrganization(suspended)).toBe(false);
    expect(canOperateOrders(suspended)).toBe(false);
    expect(can(suspended, "audit:view")).toBe(false);
  });

  it("todo papel tem um conjunto de permissões definido", () => {
    for (const role of ROLES) {
      // Não deve lançar; viewer pode ter zero permissões operacionais.
      expect(() => canOperateOrders(active(role))).not.toThrow();
    }
  });
});
