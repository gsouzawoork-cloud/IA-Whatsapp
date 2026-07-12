/**
 * Rótulos legíveis (pt-BR) dos estados de pedido, entrega e pagamento.
 * Fonte única para mensagens de sistema e para os selos da interface.
 */

import type { FulfillmentType, OrderStatus } from "./types";
import type { PaymentMethod, PaymentStatus } from "@/modules/payments/types";

export const ORDER_STATUS_LABELS: Readonly<Record<OrderStatus, string>> = {
  draft: "Rascunho",
  awaiting_information: "Aguardando informações",
  awaiting_confirmation: "Aguardando confirmação",
  awaiting_payment: "Aguardando pagamento",
  confirmed: "Confirmado",
  preparing: "Em preparação",
  ready: "Pronto",
  out_for_delivery: "Em entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const FULFILLMENT_LABELS: Readonly<Record<FulfillmentType, string>> = {
  delivery: "Entrega",
  pickup: "Retirada",
};

export const PAYMENT_METHOD_LABELS: Readonly<Record<PaymentMethod, string>> = {
  pix_simulated: "Pix (simulado)",
  card_on_delivery: "Cartão na entrega",
  cash_on_delivery: "Dinheiro",
};

export const PAYMENT_STATUS_LABELS: Readonly<Record<PaymentStatus, string>> = {
  not_started: "Não definido",
  awaiting: "Aguardando pagamento",
  paid: "Pago",
  pay_on_delivery: "Paga na entrega",
  failed: "Falhou",
  expired: "Expirado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};
