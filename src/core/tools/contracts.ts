/**
 * Contratos das ferramentas operacionais determinísticas.
 *
 * A futura IA NÃO acessa o banco diretamente: ela solicita FERRAMENTAS
 * controladas. Cada ferramenta declara schema de entrada e saída, exige
 * autorização, valida a entrada, executa de forma determinística, retorna erros
 * TIPADOS e é auditável. Este arquivo define apenas os tipos; as implementações
 * ficam em subpastas por domínio.
 *
 * Princípio de segurança: nenhuma ferramenta confia em `organization_id`
 * enviado pelo chamador. O tenant vem SEMPRE do contexto autenticado
 * (`ToolContext`).
 */

import type { ZodType } from "zod";
import type { Role, MembershipStatus } from "@/core/auth/roles";

/** Contexto autenticado e resolvido no servidor. Fonte única do tenant. */
export interface ToolContext {
  readonly organizationId: string;
  readonly unitId: string;
  readonly userId: string | null;
  readonly role: Role;
  readonly status: MembershipStatus;
}

/** Códigos de erro estáveis para ferramentas (nunca vazam detalhes internos). */
export type ToolErrorCode =
  | "unauthorized"
  | "invalid_input"
  | "not_found"
  | "conflict"
  | "unavailable"
  | "precondition_failed";

/** Erro tipado de ferramenta. `message` é seguro para exibir ao usuário final. */
export interface ToolError {
  readonly code: ToolErrorCode;
  readonly message: string;
}

/** Resultado discriminado de uma ferramenta. */
export type ToolResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: ToolError };

export function toolOk<T>(value: T): ToolResult<T> {
  return { ok: true, value };
}

export function toolErr<T = never>(
  code: ToolErrorCode,
  message: string,
): ToolResult<T> {
  return { ok: false, error: { code, message } };
}

/**
 * Definição declarativa de uma ferramenta. `permission` documenta a exigência de
 * autorização (verificada por `context.ts`). `execute` é sempre determinística
 * dado o mesmo input e a mesma fonte de dados.
 */
export interface ToolDefinition<Input, Output> {
  readonly name: string;
  /** Descrição interna (não exibida ao cliente final). */
  readonly description: string;
  readonly input: ZodType<Input>;
  readonly output: ZodType<Output>;
}
