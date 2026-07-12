/**
 * Regras puras de entrega: resolução de zona e cálculo de frete.
 *
 * Determinísticas e sem efeitos colaterais. A IA consome estes resultados, mas
 * nunca decide taxa, prazo ou disponibilidade — quem calcula é a aplicação.
 */

import { calculateOrderSubtotal } from "@/modules/orders/domain/pricing";
import type { Order } from "@/modules/orders/types";
import type { DeliveryZone, DeliveryQuote } from "../types";

/** Normaliza um texto para comparação (sem acentos, minúsculo, sem espaços). */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/** Resolve a zona de entrega ativa a partir do bairro; `null` = fora da área. */
export function resolveDeliveryZone(
  zones: readonly DeliveryZone[],
  district: string | undefined,
): DeliveryZone | null {
  if (!district) {
    return null;
  }
  const target = normalize(district);
  return (
    zones.find(
      (zone) =>
        zone.active && zone.districts.some((d) => normalize(d) === target),
    ) ?? null
  );
}

/** Calcula o frete efetivo (com regra de frete grátis) para um subtotal. */
export function getDeliveryQuote(
  zone: DeliveryZone,
  subtotalCents: number,
): DeliveryQuote {
  const freeApplied =
    zone.freeAboveCents !== undefined && subtotalCents >= zone.freeAboveCents;
  return {
    zone,
    baseFeeCents: zone.feeCents,
    feeCents: freeApplied ? 0 : zone.feeCents,
    freeApplied,
    etaMinMinutes: zone.etaMinMinutes,
    etaMaxMinutes: zone.etaMaxMinutes,
    minOrderCents: zone.minOrderCents,
    meetsMinimum: subtotalCents >= zone.minOrderCents,
  };
}

/**
 * Devolve a taxa de entrega que o pedido deve registrar, calculada pelo sistema:
 * 0 na retirada; frete da zona (com frete grátis) na entrega; taxa padrão quando
 * ainda não há endereço/zona resolvida (estado "aguardando endereço").
 */
export function resolveOrderDeliveryFee(
  order: Order,
  zones: readonly DeliveryZone[],
  defaultFeeCents: number,
): number {
  if (order.fulfillment === "pickup") {
    return 0;
  }
  const zone = resolveDeliveryZone(zones, order.address?.district);
  if (!zone) {
    return defaultFeeCents;
  }
  return getDeliveryQuote(zone, calculateOrderSubtotal(order.items)).feeCents;
}
