/**
 * Máquina de estados operacional do pedido.
 *
 * Transições restritas ao mapa `ALLOWED_TRANSITIONS`. Regras notáveis: pedido
 * confirmado não volta a rascunho; pedido entregue não volta a preparação.
 */

import { err, ok, type Result } from "@/lib/result";
import type { OrderStatus } from "../types";

const ALLOWED_TRANSITIONS: Readonly<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  draft: [
    "awaiting_information",
    "awaiting_confirmation",
    "awaiting_payment",
    "confirmed",
    "cancelled",
  ],
  awaiting_information: [
    "draft",
    "awaiting_confirmation",
    "awaiting_payment",
    "confirmed",
    "cancelled",
  ],
  awaiting_confirmation: [
    "awaiting_payment",
    "confirmed",
    "draft",
    "cancelled",
  ],
  awaiting_payment: ["confirmed", "awaiting_confirmation", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "delivered", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

/** Indica se uma transição de pedido é permitida. */
export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Valida e devolve o próximo status do pedido, ou um erro explícito. */
export function transitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
): Result<OrderStatus> {
  if (!canTransitionOrder(from, to)) {
    return err(`Transição de pedido inválida: ${from} → ${to}.`);
  }
  return ok(to);
}

/**
 * Próximo status "natural" da fila de preparo a partir do status atual e do
 * tipo de entrega. Retorna `null` quando não há avanço automático definido.
 */
export function getNextPreparationStatus(
  status: OrderStatus,
  fulfillment: "delivery" | "pickup",
): OrderStatus | null {
  switch (status) {
    case "confirmed":
      return "preparing";
    case "preparing":
      return "ready";
    case "ready":
      return fulfillment === "delivery" ? "out_for_delivery" : "delivered";
    case "out_for_delivery":
      return "delivered";
    default:
      return null;
  }
}
