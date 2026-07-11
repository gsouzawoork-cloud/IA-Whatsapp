/**
 * Regras da fila de preparo.
 *
 * O tempo estimado é determinístico e derivado de parâmetros da operação — a IA
 * nunca inventa prazos. Fórmula documentada em `calculateEstimatedPreparationTime`.
 */

import type { Order, OrderStatus } from "@/modules/orders/types";

/** Status que compõem a fila de preparo, na ordem das colunas. */
export const PREPARATION_STATUSES: readonly OrderStatus[] = [
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
];

/** Minutos adicionais por pedido ativo já na fila. */
const MINUTES_PER_ACTIVE_ORDER = 4;
/** Minutos adicionais por item do pedido. */
const MINUTES_PER_ITEM = 2;

/**
 * Tempo estimado de preparo, em minutos:
 *
 *   tempo padrão da empresa
 *   + (pedidos ativos na fila × 4)
 *   + (quantidade de itens do pedido × 2)
 *
 * Determinístico: mesmas entradas produzem sempre o mesmo resultado.
 */
export function calculateEstimatedPreparationTime(params: {
  readonly basePreparationMinutes: number;
  readonly activeOrders: number;
  readonly itemCount: number;
}): number {
  const { basePreparationMinutes, activeOrders, itemCount } = params;
  return (
    basePreparationMinutes +
    Math.max(0, activeOrders) * MINUTES_PER_ACTIVE_ORDER +
    Math.max(0, itemCount) * MINUTES_PER_ITEM
  );
}

/** Total de itens de um pedido (soma das quantidades). */
export function countOrderItems(order: Order): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Fila de preparo agrupada por status, preservando a ordem das colunas.
 * Só entram pedidos cujos status pertencem à fila.
 */
export function getPreparationQueue(
  orders: readonly Order[],
): Record<OrderStatus, Order[]> {
  const queue = {} as Record<OrderStatus, Order[]>;
  for (const status of PREPARATION_STATUSES) {
    queue[status] = [];
  }
  for (const order of orders) {
    if (PREPARATION_STATUSES.includes(order.status)) {
      queue[order.status].push(order);
    }
  }
  return queue;
}
