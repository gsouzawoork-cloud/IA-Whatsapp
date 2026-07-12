/**
 * Papéis de uma organização.
 *
 * Fonte única e tipada dos papéis. Espelha o enum `app_role` do banco. A
 * autorização de INTERFACE deriva daqui; a autorização INVIOLÁVEL vive na RLS do
 * PostgreSQL. Este módulo nunca decide sozinho — ele existe para experiência do
 * usuário e para checagens no servidor antes de chamar o banco.
 */

/** Papéis conhecidos, do mais poderoso ao mais restrito. */
export const ROLES = ["owner", "admin", "manager", "agent", "viewer"] as const;

export type Role = (typeof ROLES)[number];

/** Rótulos legíveis (pt-BR) por papel. */
export const ROLE_LABELS: Readonly<Record<Role, string>> = {
  owner: "Proprietário",
  admin: "Administrador",
  manager: "Gerente",
  agent: "Atendente",
  viewer: "Visualizador",
};

/**
 * Situação do vínculo. Apenas `active` concede acesso; `suspended` remove todo
 * o acesso (validado também pela RLS via `is_active_member`).
 */
export type MembershipStatus = "active" | "suspended";

/** Type guard para valores de papel vindos de dados externos. */
export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
