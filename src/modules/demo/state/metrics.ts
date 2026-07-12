/**
 * Indicadores operacionais derivados dos dados simulados.
 *
 * Nenhum número é digitado na interface: tudo é calculado a partir do estado.
 * Mantido enxuto — sem métricas financeiras ou de marketing.
 */

import type { DemoData } from "@/data/demo";
import type { Order } from "@/modules/orders/types";
import { isProductAvailable } from "@/modules/catalog/domain/availability";
import {
  PREPARATION_STATUSES,
  getPreparationQueue,
} from "@/modules/preparation/domain/queue";
import { ORDER_STATUS_LABELS } from "@/modules/orders/labels";

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

/** Tom semântico de um insight operacional. */
export type InsightTone = "accent" | "info" | "warn" | "neutral";

/** Um insight interpretado da operação (derivado dos dados, não digitado). */
export interface OperationInsight {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly tone: InsightTone;
}

/**
 * "Inteligência da operação": interpreta o estado atual (gargalos, pendências)
 * de forma determinística a partir dos dados simulados. Não é IA real.
 */
export function getOperationInsights(data: DemoData): OperationInsight[] {
  const insights: OperationInsight[] = [];

  const queue = getPreparationQueue(data.orders);
  let topStatus = PREPARATION_STATUSES[0]!;
  for (const status of PREPARATION_STATUSES) {
    if (queue[status].length > queue[topStatus].length) {
      topStatus = status;
    }
  }
  const topCount = queue[topStatus].length;
  insights.push({
    id: "bottleneck",
    label: "Maior gargalo",
    detail:
      topCount > 0
        ? `${ORDER_STATUS_LABELS[topStatus]} com ${topCount} ${topCount === 1 ? "pedido" : "pedidos"}`
        : "Fila sem acúmulo",
    tone: topCount >= 2 ? "warn" : "accent",
  });

  const waitingHuman = data.conversations.filter(
    (c) => c.status === "waiting_human",
  ).length;
  insights.push({
    id: "waiting-human",
    label: "Aguardando humano",
    detail: `${waitingHuman} ${waitingHuman === 1 ? "conversa precisa" : "conversas precisam"} de atendente`,
    tone: waitingHuman > 0 ? "warn" : "neutral",
  });

  const awaitingPayment = data.orders.filter(
    (o) => o.status === "awaiting_payment",
  ).length;
  insights.push({
    id: "awaiting-payment",
    label: "Aguardando pagamento",
    detail: `${awaitingPayment} ${awaitingPayment === 1 ? "pedido" : "pedidos"} sem confirmação`,
    tone: awaitingPayment > 0 ? "info" : "neutral",
  });

  const unavailable = getUnavailableProducts(data).length;
  insights.push({
    id: "unavailable",
    label: "Cardápio",
    detail:
      unavailable > 0
        ? `${unavailable} ${unavailable === 1 ? "produto indisponível" : "produtos indisponíveis"} na oferta`
        : "Todos os produtos disponíveis",
    tone: unavailable > 0 ? "warn" : "accent",
  });

  return insights;
}

/** Pedidos recentes (mais novos primeiro), limitados. */
export function getRecentOrders(data: DemoData, limit = 5): Order[] {
  return [...data.orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
