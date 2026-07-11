/**
 * Rótulos legíveis (pt-BR) dos estados de conversa e do responsável.
 */

import type { ConversationResponsible, ConversationStatus } from "./types";

export const CONVERSATION_STATUS_LABELS: Readonly<
  Record<ConversationStatus, string>
> = {
  new: "Nova",
  ai_active: "IA atendendo",
  waiting_customer: "Aguardando cliente",
  waiting_human: "Aguardando atendente",
  human_active: "Atendimento humano",
  transferred: "Transferida",
  resolved: "Resolvida",
  closed: "Encerrada",
};

export const CONVERSATION_RESPONSIBLE_LABELS: Readonly<
  Record<ConversationResponsible, string>
> = {
  ai: "IA",
  human: "Humano",
  none: "—",
};
