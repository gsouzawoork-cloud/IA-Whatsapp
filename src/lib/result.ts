/**
 * Resultado explícito para regras de domínio.
 *
 * As regras puras não lançam exceções para fluxos previsíveis: retornam um
 * `Result` discriminado, obrigando quem chama a tratar sucesso e falha.
 */
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };

/** Constrói um resultado de sucesso. */
export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

/** Constrói um resultado de falha com mensagem legível. */
export function err<T = never>(error: string): Result<T> {
  return { ok: false, error };
}
