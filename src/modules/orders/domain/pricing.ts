/**
 * Cálculos determinísticos de preço do pedido (em centavos).
 *
 * Nunca derivar totais manualmente na interface: subtotal, taxa e total vêm
 * sempre destas funções puras.
 */

import type { FulfillmentType, OrderItem } from "../types";

/** Soma dos itens: preço unitário × quantidade. */
export function calculateOrderSubtotal(items: readonly OrderItem[]): number {
  return items.reduce(
    (total, item) => total + item.unitPriceCents * item.quantity,
    0,
  );
}

/** Taxa de entrega: retirada não tem taxa; entrega usa a taxa padrão da empresa. */
export function calculateDeliveryFee(
  fulfillment: FulfillmentType,
  defaultDeliveryFeeCents: number,
): number {
  return fulfillment === "delivery" ? defaultDeliveryFeeCents : 0;
}

/** Total do pedido: subtotal + taxa de entrega. */
export function calculateOrderTotal(
  items: readonly OrderItem[],
  deliveryFeeCents: number,
): number {
  return calculateOrderSubtotal(items) + deliveryFeeCents;
}
