/**
 * Funções de autorização de alto nível.
 *
 * São wrappers legíveis sobre a matriz de permissões, para uso em componentes e
 * no servidor. Um usuário SUSPENSO nunca tem permissão, independentemente do
 * papel (espelha a RLS, que exige membership ativo).
 */

import type { Role, MembershipStatus } from "./roles";
import { roleHasPermission, type Permission } from "./permissions";

/** Contexto mínimo de autorização: papel + situação do vínculo. */
export interface AuthzContext {
  readonly role: Role;
  readonly status: MembershipStatus;
}

/** Base: possui a permissão E está ativo. */
export function can(ctx: AuthzContext, permission: Permission): boolean {
  if (ctx.status !== "active") {
    return false;
  }
  return roleHasPermission(ctx.role, permission);
}

// ---- Helpers nomeados (exigidos pela especificação) -----------------------

export const canManageOrganization = (c: AuthzContext) => can(c, "organization:manage");
export const canTransferOrganization = (c: AuthzContext) => can(c, "organization:transfer");
export const canManageUnits = (c: AuthzContext) => can(c, "units:manage");
export const canManageModules = (c: AuthzContext) => can(c, "modules:manage");
export const canManageMembers = (c: AuthzContext) => can(c, "members:manage");
export const canManageCatalog = (c: AuthzContext) => can(c, "catalog:manage");
export const canManageAvailability = (c: AuthzContext) => can(c, "availability:manage");
export const canManageDelivery = (c: AuthzContext) => can(c, "delivery:manage");
export const canManageAgent = (c: AuthzContext) => can(c, "agent:manage");
export const canManageKnowledge = (c: AuthzContext) => can(c, "knowledge:manage");
export const canOperateOrders = (c: AuthzContext) => can(c, "orders:operate");
export const canOperateConversations = (c: AuthzContext) => can(c, "conversations:operate");
export const canOperateCustomers = (c: AuthzContext) => can(c, "customers:operate");
export const canViewAuditLogs = (c: AuthzContext) => can(c, "audit:view");
