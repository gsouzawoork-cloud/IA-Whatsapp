/**
 * Utilitários internos dos sub-reducers.
 *
 * Todas as operações são imutáveis: produzem novos objetos, nunca mutam o
 * estado recebido. O feedback usa um contador crescente para reacionar a
 * interface a cada ação, mesmo quando a mensagem se repete.
 */

import type { DemoData } from "@/data/demo";
import type { Conversation, Message } from "@/modules/conversations/types";
import type { Order } from "@/modules/orders/types";
import type { ActionMeta, DemoState, FeedbackKind } from "../types";

/** Aplica uma alteração de estado, opcionalmente com feedback. */
export function commit(
  state: DemoState,
  patch: Partial<DemoState>,
  feedback?: { kind: FeedbackKind; message: string },
): DemoState {
  if (!feedback) {
    return { ...state, ...patch };
  }
  const seq = state.feedbackSeq + 1;
  return {
    ...state,
    ...patch,
    feedback: { seq, kind: feedback.kind, message: feedback.message },
    feedbackSeq: seq,
  };
}

/** Retorna o estado apenas com um feedback de erro (sem alterar dados). */
export function fail(state: DemoState, message: string): DemoState {
  return commit(state, {}, { kind: "error", message });
}

/** Constrói uma mensagem de sistema determinística. */
export function systemMessage(
  conversationId: string,
  content: string,
  meta: ActionMeta,
  idSuffix = "",
): Message {
  return {
    id: `${meta.id}${idSuffix}`,
    conversationId,
    authorType: "system",
    authorName: "Sistema",
    content,
    createdAt: meta.now,
    origin: "system",
    read: true,
  };
}

export function appendMessage(data: DemoData, message: Message): DemoData {
  return { ...data, messages: [...data.messages, message] };
}

export function patchConversation(
  data: DemoData,
  id: string,
  patch: Partial<Conversation>,
): DemoData {
  return {
    ...data,
    conversations: data.conversations.map((c) =>
      c.id === id ? { ...c, ...patch } : c,
    ),
  };
}

export function patchOrder(
  data: DemoData,
  id: string,
  patch: Partial<Order>,
): DemoData {
  return {
    ...data,
    orders: data.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
  };
}

/** Marca todas as mensagens de uma conversa como lidas e zera o não lido. */
export function markConversationRead(data: DemoData, conversationId: string): DemoData {
  const withMessages: DemoData = {
    ...data,
    messages: data.messages.map((m) =>
      m.conversationId === conversationId && !m.read ? { ...m, read: true } : m,
    ),
  };
  return patchConversation(withMessages, conversationId, { unreadCount: 0 });
}
