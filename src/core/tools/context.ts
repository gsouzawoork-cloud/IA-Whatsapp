/**
 * Autorização e validação compartilhadas pelas ferramentas.
 *
 * Toda ferramenta segue o mesmo fluxo: authorize → validate → execute. Estes
 * helpers concentram os dois primeiros passos, evitando repetição e garantindo
 * que nenhuma ferramenta esqueça a checagem de permissão.
 */

import type { ZodType } from "zod";
import { can, type AuthzContext } from "@/core/auth/authorize";
import type { Permission } from "@/core/auth/permissions";
import {
  toolErr,
  type ToolContext,
  type ToolResult,
} from "./contracts";

/** Deriva o contexto de autorização a partir do contexto da ferramenta. */
export function authzOf(ctx: ToolContext): AuthzContext {
  return { role: ctx.role, status: ctx.status };
}

/** Garante que o contexto possui a permissão; caso contrário, erro tipado. */
export function requirePermission<T>(
  ctx: ToolContext,
  permission: Permission,
): ToolResult<T> | null {
  if (!can(authzOf(ctx), permission)) {
    return toolErr<T>("unauthorized", "Você não tem permissão para esta ação.");
  }
  return null;
}

/**
 * Valida a entrada com um schema Zod. Retorna a entrada tipada ou um erro
 * `invalid_input` com mensagem segura (sem detalhes internos de caminho).
 */
export function validateInput<T>(
  schema: ZodType<T>,
  raw: unknown,
): ToolResult<T> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return toolErr<T>(
      "invalid_input",
      first ? first.message : "Entrada inválida.",
    );
  }
  return { ok: true, value: parsed.data };
}
