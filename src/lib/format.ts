/**
 * Utilitários de formatação para a apresentação.
 *
 * Valores monetários circulam pelo domínio em **centavos** (inteiros) para
 * garantir cálculos determinísticos sem erros de ponto flutuante. A conversão
 * para exibição acontece apenas aqui, na borda de apresentação.
 */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata centavos como moeda brasileira (ex.: 4990 → "R$ 49,90"). */
export function formatCurrency(cents: number): string {
  return BRL.format(cents / 100);
}

/**
 * Formata um telefone brasileiro parcialmente mascarado, preservando DDD e os
 * últimos dígitos para identificação sem expor o número completo.
 * Ex.: "5511998765432" → "(11) 9****-5432".
 */
export function formatMaskedPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("55") ? digits.slice(2) : digits;
  if (local.length < 6) {
    return raw;
  }
  const ddd = local.slice(0, 2);
  const last4 = local.slice(-4);
  const firstOfNumber = local.slice(2, 3);
  return `(${ddd}) ${firstOfNumber}****-${last4}`;
}

const TIME = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const DATE_TIME = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** Formata apenas o horário (HH:mm) de uma data ISO. */
export function formatTime(iso: string): string {
  return TIME.format(new Date(iso));
}

/** Formata data e hora curtas (dd/mm HH:mm) de uma data ISO. */
export function formatDateTime(iso: string): string {
  return DATE_TIME.format(new Date(iso));
}

/**
 * Descreve o tempo decorrido desde `iso` até `now` de forma amigável.
 * Usado apenas para exibição operacional (não é uma regra de domínio).
 */
export function formatElapsed(iso: string, now: number = Date.now()): string {
  const diffMs = now - new Date(iso).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) {
    return "agora";
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const rest = minutes % 60;
    return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return `${days} d`;
}

/** Formata minutos como duração legível (ex.: 75 → "1 h 15 min"). */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`;
}
