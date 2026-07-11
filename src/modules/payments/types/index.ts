/**
 * Tipos de pagamento simulado.
 *
 * O status de pagamento é mantido separado do status operacional do pedido,
 * conforme o modelo conceitual de dados. Nenhum pagamento real é processado.
 */

/** Formas de pagamento aceitas na simulação. */
export type PaymentMethod =
  | "pix_simulated"
  | "card_on_delivery"
  | "cash_on_delivery";

/** Estados possíveis de um pagamento. */
export type PaymentStatus =
  | "not_started"
  | "awaiting"
  | "paid"
  | "pay_on_delivery"
  | "failed"
  | "expired"
  | "cancelled"
  | "refunded";

/** Bandeira do cartão quando pago na entrega. */
export type CardKind = "credit" | "debit";

/** Detalhes de pagamento associados a um pedido. */
export interface PaymentDetails {
  readonly method: PaymentMethod;
  status: PaymentStatus;
  /** Crédito/débito quando `card_on_delivery`. */
  cardKind?: CardKind;
  /** Valor entregue em centavos quando `cash_on_delivery`. */
  cashGivenCents?: number;
  /** Troco calculado pela aplicação em centavos. */
  changeCents?: number;
}
