/**
 * Ferramenta determinística: cotação de entrega.
 *
 * O frete NUNCA é inventado pela IA. Ele vem de uma zona cadastrada. Regras:
 *   * zona encontrada        → status "available" (com regra de frete grátis);
 *   * critério informado mas
 *     sem zona correspondente → status "unavailable";
 *   * sem critério suficiente
 *     para decidir            → status "manual_review".
 */

import { z } from "zod";

/** Subconjunto de `delivery_zones` necessário para a cotação. */
export interface QuoteZone {
  readonly id: string;
  readonly neighborhoods: readonly string[];
  readonly postalCodeStart: string | null;
  readonly postalCodeEnd: string | null;
  readonly deliveryFeeCents: number;
  readonly minimumOrderCents: number;
  readonly freeDeliveryThresholdCents: number | null;
  readonly estimatedMinMinutes: number;
  readonly estimatedMaxMinutes: number;
  readonly isActive: boolean;
}

export const deliveryQuoteInput = z.object({
  unitId: z.string().uuid(),
  postalCode: z.string().trim().min(1).optional(),
  neighborhood: z.string().trim().min(1).optional(),
  subtotalCents: z.number().int().nonnegative(),
});
export type DeliveryQuoteInput = z.infer<typeof deliveryQuoteInput>;

export type DeliveryQuoteStatus = "available" | "unavailable" | "manual_review";

export interface DeliveryQuoteResult {
  readonly status: DeliveryQuoteStatus;
  readonly deliveryZoneId: string | null;
  readonly feeCents: number;
  readonly minimumOrderCents: number;
  readonly estimatedMin: number | null;
  readonly estimatedMax: number | null;
  readonly freeDeliveryApplied: boolean;
  readonly reason: string;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/** Apenas dígitos de um CEP, para comparação numérica de faixas. */
function digits(value: string): string {
  return value.replace(/\D/g, "");
}

function matchesPostal(zone: QuoteZone, postal: string): boolean {
  if (!zone.postalCodeStart || !zone.postalCodeEnd) {
    return false;
  }
  const target = digits(postal);
  const start = digits(zone.postalCodeStart);
  const end = digits(zone.postalCodeEnd);
  if (target.length === 0 || start.length === 0 || end.length === 0) {
    return false;
  }
  return target >= start && target <= end;
}

/** Cotação pura a partir das zonas cadastradas da unidade. */
export function quoteDelivery(
  zones: readonly QuoteZone[],
  input: DeliveryQuoteInput,
): DeliveryQuoteResult {
  const active = zones.filter((z) => z.isActive);

  // Sem critério suficiente para decidir: revisão manual (nunca inventar).
  if (!input.neighborhood && !input.postalCode) {
    return {
      status: "manual_review",
      deliveryZoneId: null,
      feeCents: 0,
      minimumOrderCents: 0,
      estimatedMin: null,
      estimatedMax: null,
      freeDeliveryApplied: false,
      reason: "Informe bairro ou CEP para cotar a entrega.",
    };
  }

  const zone = active.find((z) => {
    const byNeighborhood =
      input.neighborhood !== undefined &&
      z.neighborhoods.some((n) => normalize(n) === normalize(input.neighborhood as string));
    const byPostal =
      input.postalCode !== undefined && matchesPostal(z, input.postalCode);
    return byNeighborhood || byPostal;
  });

  if (!zone) {
    return {
      status: "unavailable",
      deliveryZoneId: null,
      feeCents: 0,
      minimumOrderCents: 0,
      estimatedMin: null,
      estimatedMax: null,
      freeDeliveryApplied: false,
      reason: "Região não atendida por nenhuma zona de entrega cadastrada.",
    };
  }

  const freeApplied =
    zone.freeDeliveryThresholdCents !== null &&
    input.subtotalCents >= zone.freeDeliveryThresholdCents;

  return {
    status: "available",
    deliveryZoneId: zone.id,
    feeCents: freeApplied ? 0 : zone.deliveryFeeCents,
    minimumOrderCents: zone.minimumOrderCents,
    estimatedMin: zone.estimatedMinMinutes,
    estimatedMax: zone.estimatedMaxMinutes,
    freeDeliveryApplied: freeApplied,
    reason: freeApplied ? "Frete grátis aplicado pela regra da zona." : "Entrega disponível.",
  };
}
