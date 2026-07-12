/**
 * Tipos do módulo de entrega (frete determinístico por zona).
 *
 * O frete NUNCA é definido pela IA: a aplicação resolve a zona a partir do
 * bairro/endereço e calcula taxa, prazo e pedido mínimo. A IA apenas consulta e
 * comunica o valor retornado pelo sistema.
 */

/** Zona de entrega configurável (simulada). */
export interface DeliveryZone {
  readonly id: string;
  readonly name: string;
  /** Bairros atendidos por esta zona (correspondência determinística). */
  readonly districts: readonly string[];
  /** Taxa de entrega da zona, em centavos. */
  readonly feeCents: number;
  readonly etaMinMinutes: number;
  readonly etaMaxMinutes: number;
  /** Pedido mínimo para entrega na zona, em centavos. */
  readonly minOrderCents: number;
  /** Frete grátis acima deste subtotal (centavos), quando definido. */
  readonly freeAboveCents?: number;
  readonly active: boolean;
}

/** Resultado determinístico da consulta de frete para um pedido. */
export interface DeliveryQuote {
  readonly zone: DeliveryZone;
  /** Taxa efetiva (0 quando o frete grátis se aplica). */
  readonly feeCents: number;
  readonly baseFeeCents: number;
  readonly freeApplied: boolean;
  readonly etaMinMinutes: number;
  readonly etaMaxMinutes: number;
  readonly minOrderCents: number;
  readonly meetsMinimum: boolean;
}
