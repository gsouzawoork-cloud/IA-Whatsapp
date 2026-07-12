/**
 * Indicadores operacionais derivados dos dados simulados.
 *
 * Nenhum número é digitado na interface: tudo é calculado a partir do estado.
 * Mantido enxuto — sem métricas financeiras ou de marketing.
 */

import type { DemoData } from "@/data/demo";
import type { Order } from "@/modules/orders/types";
import { isProductAvailable } from "@/modules/catalog/domain/availability";

/** Indicadores principais da visão geral (no máximo seis). */
export interface OverviewMetrics {
  readonly conversationsNeedingAttention: number;
  readonly conversationsWithAI: number;
  readonly activeHumanConversations: number;
  readonly ordersInProgress: number;
  readonly ordersAwaitingConfirmation: number;
  readonly averageFirstResponseMinutes: number;
}

const IN_PROGRESS_ORDER_STATUSES: readonly Order["status"][] = [
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
];

export function getOverviewMetrics(data: DemoData): OverviewMetrics {
  const conversationsNeedingAttention = data.conversations.filter(
    (c) => c.status === "new" || c.status === "waiting_human",
  ).length;

  const conversationsWithAI = data.conversations.filter(
    (c) => c.responsible === "ai",
  ).length;

  const activeHumanConversations = data.conversations.filter(
    (c) => c.status === "human_active",
  ).length;

  const ordersInProgress = data.orders.filter((o) =>
    IN_PROGRESS_ORDER_STATUSES.includes(o.status),
  ).length;

  const ordersAwaitingConfirmation = data.orders.filter(
    (o) =>
      o.status === "awaiting_confirmation" ||
      o.status === "awaiting_payment" ||
      o.status === "draft",
  ).length;

  return {
    conversationsNeedingAttention,
    conversationsWithAI,
    activeHumanConversations,
    ordersInProgress,
    ordersAwaitingConfirmation,
    // Valor simulado, estável e discreto (não é uma medição real).
    averageFirstResponseMinutes: 3,
  };
}

/** Produtos indisponíveis ou com quantidade zerada, para a visão geral. */
export function getUnavailableProducts(data: DemoData) {
  return data.products.filter((p) => !isProductAvailable(p));
}

/** Pedidos recentes (mais novos primeiro), limitados. */
export function getRecentOrders(data: DemoData, limit = 5): Order[] {
  return [...data.orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
