/**
 * Seletores puros sobre os dados da demonstração.
 *
 * Não mutam nada e não dependem de React. As páginas os usam para derivar o que
 * exibem, evitando espalhar `find`/`filter` pela interface.
 */

import type { DemoData } from "@/data/demo";
import type { Conversation, ConversationStatus } from "@/modules/conversations/types";
import type { Order } from "@/modules/orders/types";
import type { Product } from "@/modules/catalog/types";
import type { Customer } from "@/modules/customers/types";
import {
  calculateOrderSubtotal,
  calculateOrderTotal,
} from "@/modules/orders/domain/pricing";
import {
  getDeliveryQuote,
  resolveDeliveryZone,
} from "@/modules/delivery/domain/zones";
import type { DeliveryQuote } from "@/modules/delivery/types";

/** Filtros disponíveis na lista de conversas. */
export type ConversationFilter =
  | "all"
  | "attention"
  | "ai"
  | "human"
  | "waiting_customer"
  | "resolved";

/** Status que representam "precisa de atenção". */
const ATTENTION_STATUSES: readonly ConversationStatus[] = [
  "new",
  "waiting_human",
];

export function getConversation(
  data: DemoData,
  id: string | null,
): Conversation | undefined {
  if (!id) {
    return undefined;
  }
  return data.conversations.find((c) => c.id === id);
}

export function getCustomer(data: DemoData, id: string): Customer | undefined {
  return data.customers.find((c) => c.id === id);
}

export function getOrder(data: DemoData, id: string | undefined): Order | undefined {
  if (!id) {
    return undefined;
  }
  return data.orders.find((o) => o.id === id);
}

export function getProduct(data: DemoData, id: string): Product | undefined {
  return data.products.find((p) => p.id === id);
}

/** Mensagens de uma conversa, ordenadas cronologicamente. */
export function getConversationMessages(data: DemoData, conversationId: string) {
  return data.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Peso de prioridade por status, para ordenar a lista de conversas. */
function statusPriority(status: ConversationStatus): number {
  switch (status) {
    case "new":
      return 0;
    case "waiting_human":
      return 1;
    case "human_active":
      return 2;
    case "ai_active":
      return 3;
    case "waiting_customer":
      return 4;
    case "transferred":
      return 5;
    case "resolved":
      return 6;
    case "closed":
      return 7;
  }
}

function matchesFilter(
  conversation: Conversation,
  filter: ConversationFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "attention":
      return ATTENTION_STATUSES.includes(conversation.status);
    case "ai":
      return conversation.responsible === "ai";
    case "human":
      return conversation.responsible === "human";
    case "waiting_customer":
      return conversation.status === "waiting_customer";
    case "resolved":
      return conversation.status === "resolved" || conversation.status === "closed";
  }
}

/** Aplica busca textual (nome, telefone ou assunto) a uma conversa. */
function matchesQuery(
  conversation: Conversation,
  customer: Customer | undefined,
  query: string,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  const haystack = [
    customer?.name ?? "",
    customer?.phone ?? "",
    conversation.subject,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(normalized);
}

/** Lista de conversas filtrada, buscada e ordenada por prioridade e atividade. */
export function listConversations(
  data: DemoData,
  filter: ConversationFilter,
  query: string,
): Conversation[] {
  return data.conversations
    .filter((conversation) => {
      const customer = getCustomer(data, conversation.customerId);
      return (
        matchesFilter(conversation, filter) &&
        matchesQuery(conversation, customer, query)
      );
    })
    .sort((a, b) => {
      const priority = statusPriority(a.status) - statusPriority(b.status);
      if (priority !== 0) {
        return priority;
      }
      return b.lastMessageAt.localeCompare(a.lastMessageAt);
    });
}

/** Subtotal e total do pedido, derivados pelas regras puras (em centavos). */
export function getOrderTotals(order: Order): {
  subtotalCents: number;
  totalCents: number;
} {
  const subtotalCents = calculateOrderSubtotal(order.items);
  return {
    subtotalCents,
    totalCents: calculateOrderTotal(order.items, order.deliveryFeeCents),
  };
}

/**
 * Consulta de entrega para um pedido (zona + frete calculados pelo sistema).
 * Retorna `null` para retirada, sem endereço ou região fora da área.
 */
export function getOrderDeliveryQuote(
  data: DemoData,
  order: Order,
): DeliveryQuote | null {
  if (order.fulfillment !== "delivery" || !order.address) {
    return null;
  }
  const zone = resolveDeliveryZone(data.deliveryZones, order.address.district);
  if (!zone) {
    return null;
  }
  return getDeliveryQuote(zone, calculateOrderSubtotal(order.items));
}

/** Pedidos de um cliente, mais recentes primeiro. */
export function getCustomerOrders(data: DemoData, customerId: string): Order[] {
  return data.orders
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Conversas de um cliente, mais recentes primeiro. */
export function getCustomerConversations(
  data: DemoData,
  customerId: string,
): Conversation[] {
  return data.conversations
    .filter((c) => c.customerId === customerId)
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}
