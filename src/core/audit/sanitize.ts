/**
 * Sanitização de metadados de auditoria.
 *
 * A trilha de auditoria NUNCA pode conter segredos. Esta função remove chaves
 * sensíveis (por nome) e trunca valores longos, retornando um objeto seguro para
 * persistir. É pura e testável.
 */

/** Fragmentos de nome de chave que indicam dado sensível (case-insensitive). */
const SENSITIVE_KEY_PATTERNS = [
  "password",
  "senha",
  "token",
  "secret",
  "segredo",
  "authorization",
  "cookie",
  "api_key",
  "apikey",
  "service_role",
  "card",
  "cartao",
  "cvv",
  "document",
  "cpf",
  "cnpj",
  "refresh",
  "access_token",
] as const;

const MAX_STRING = 500;
const REDACTED = "[redacted]";

function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((p) => k.includes(p));
}

/**
 * Retorna uma cópia sanitizada de `metadata`: chaves sensíveis viram
 * "[redacted]", strings longas são truncadas, e apenas tipos JSON simples são
 * preservados (funções/símbolos são descartados).
 */
export function sanitizeAuditMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (isSensitiveKey(key)) {
      out[key] = REDACTED;
      continue;
    }
    out[key] = sanitizeValue(value);
  }
  return out;
}

function sanitizeValue(value: unknown): unknown {
  if (value === null) {
    return null;
  }
  switch (typeof value) {
    case "string":
      return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
    case "number":
    case "boolean":
      return value;
    case "object": {
      if (Array.isArray(value)) {
        return value.slice(0, 50).map(sanitizeValue);
      }
      return sanitizeAuditMetadata(value as Record<string, unknown>);
    }
    default:
      // function, symbol, undefined, bigint → descartado.
      return undefined;
  }
}
