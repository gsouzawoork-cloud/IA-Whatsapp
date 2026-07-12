/**
 * Regras puras da máquina de estados de conversa.
 *
 * Nenhuma transição arbitrária é permitida: apenas as mapeadas em
 * `ALLOWED_TRANSITIONS`. As funções são determinísticas, não acessam `window`
 * e não mutam objetos.
 */

import { err, ok, type Result } from "@/lib/result";
import type { ConversationStatus } from "../types";

/** Transições permitidas por estado de origem. */
const ALLOWED_TRANSITIONS: Readonly<
  Record<ConversationStatus, readonly ConversationStatus[]>
> = {
  new: ["ai_active", "waiting_human", "human_active"],
  ai_active: ["waiting_customer", "waiting_human", "human_active", "resolved"],
  waiting_customer: ["ai_active", "waiting_human", "human_active", "resolved"],
  waiting_human: ["human_active", "ai_active", "transferred", "resolved"],
  human_active: [
    "waiting_customer",
    "ai_active",
    "transferred",
    "resolved",
  ],
  transferred: ["human_active", "ai_active", "resolved"],
  resolved: ["ai_active", "human_active", "closed"],
  closed: [],
};

/** Indica se uma transição de conversa é permitida. */
export function isConversationTransitionAllowed(
  from: ConversationStatus,
  to: ConversationStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Valida e devolve o próximo estado, ou um erro explícito. */
export function transitionConversationStatus(
  from: ConversationStatus,
  to: ConversationStatus,
): Result<ConversationStatus> {
  if (from === to) {
    return ok(to);
  }
  if (!isConversationTransitionAllowed(from, to)) {
    return err(`Transição de conversa inválida: ${from} → ${to}.`);
  }
  return ok(to);
}

/** Um atendente humano pode assumir a conversa. */
export function canTakeOverConversation(status: ConversationStatus): boolean {
  return isConversationTransitionAllowed(status, "human_active");
}

/** A conversa pode ser devolvida para a IA. */
export function canReturnConversationToAI(
  status: ConversationStatus,
): boolean {
  return status !== "ai_active" && isConversationTransitionAllowed(status, "ai_active");
}

/** A conversa pode ser marcada como resolvida. */
export function canResolveConversation(status: ConversationStatus): boolean {
  return isConversationTransitionAllowed(status, "resolved");
}

/** A conversa pode ser reaberta (apenas quando resolvida). */
export function canReopenConversation(status: ConversationStatus): boolean {
  return status === "resolved";
}
