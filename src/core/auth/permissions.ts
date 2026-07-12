/**
 * Matriz de permissões por papel.
 *
 * Centralizada e tipada: evita o anti-padrão de espalhar `if (role === "admin")`
 * por dezenas de componentes. Cada permissão é uma capacidade nomeada; a matriz
 * abaixo é a ÚNICA fonte de verdade da autorização de interface/servidor.
 *
 * Lembrete de segurança: isto NÃO substitui a RLS. É a primeira camada (UX +
 * checagem no servidor antes de tocar o banco). A barreira final é o PostgreSQL.
 */

import type { Role } from "./roles";

/** Capacidades nomeadas da plataforma. */
export type Permission =
  | "organization:manage"
  | "organization:transfer"
  | "units:manage"
  | "modules:manage"
  | "members:manage"
  | "catalog:manage"
  | "availability:manage"
  | "delivery:manage"
  | "agent:manage"
  | "knowledge:manage"
  | "orders:operate"
  | "conversations:operate"
  | "customers:operate"
  | "audit:view";

/**
 * Matriz papel → permissões. Deriva diretamente da especificação da Fase 3.
 * Usa Set para checagem O(1).
 */
const MATRIX: Readonly<Record<Role, ReadonlySet<Permission>>> = {
  owner: new Set<Permission>([
    "organization:manage",
    "organization:transfer",
    "units:manage",
    "modules:manage",
    "members:manage",
    "catalog:manage",
    "availability:manage",
    "delivery:manage",
    "agent:manage",
    "knowledge:manage",
    "orders:operate",
    "conversations:operate",
    "customers:operate",
    "audit:view",
  ]),
  admin: new Set<Permission>([
    // Igual ao owner, EXCETO transferência de propriedade.
    "organization:manage",
    "units:manage",
    "modules:manage",
    "members:manage",
    "catalog:manage",
    "availability:manage",
    "delivery:manage",
    "agent:manage",
    "knowledge:manage",
    "orders:operate",
    "conversations:operate",
    "customers:operate",
    "audit:view",
  ]),
  manager: new Set<Permission>([
    // Opera a empresa e gerencia dados operacionais, mas não membros nem
    // segurança/agente.
    "catalog:manage",
    "availability:manage",
    "delivery:manage",
    "knowledge:manage",
    "orders:operate",
    "conversations:operate",
    "customers:operate",
  ]),
  agent: new Set<Permission>([
    // Apenas operação de atendimento. NÃO altera preço, entrega ou IA.
    "orders:operate",
    "conversations:operate",
    "customers:operate",
  ]),
  viewer: new Set<Permission>([
    // Somente leitura: nenhuma permissão de escrita/operação.
  ]),
};

/** `true` se o papel possui a permissão. */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  return MATRIX[role].has(permission);
}

/** Lista (ordenada) de permissões de um papel — útil para exibição/depuração. */
export function permissionsForRole(role: Role): readonly Permission[] {
  return [...MATRIX[role]].sort();
}
