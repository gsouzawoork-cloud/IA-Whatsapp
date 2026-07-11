/**
 * Tipos do domínio de conversas e mensagens.
 *
 * Os estados são um conjunto fechado e centralizado. As transições permitidas
 * vivem nas regras puras em `../domain`, nunca espalhadas pela interface.
 */

/** Estados conceituais de uma conversa (conjunto fechado). */
export type ConversationStatus =
  | "new"
  | "ai_active"
  | "waiting_customer"
  | "waiting_human"
  | "human_active"
  | "transferred"
  | "resolved"
  | "closed";

/** Quem conduz a conversa no momento. */
export type ConversationResponsible = "ai" | "human" | "none";

/** Autor de uma mensagem. */
export type MessageAuthorType = "customer" | "ai" | "human" | "system";

/** Origem por onde a mensagem entrou na plataforma. */
export type MessageOrigin = "whatsapp" | "platform" | "system";

/** Mensagem simulada dentro de uma conversa. */
export interface Message {
  readonly id: string;
  readonly conversationId: string;
  readonly authorType: MessageAuthorType;
  /** Nome apresentado do autor (cliente, agente de IA ou atendente). */
  readonly authorName: string;
  readonly content: string;
  /** Data/hora ISO 8601. */
  readonly createdAt: string;
  readonly origin: MessageOrigin;
  readonly read: boolean;
}

/** Conversa entre um cliente e a empresa. */
export interface Conversation {
  readonly id: string;
  readonly customerId: string;
  readonly channel: "whatsapp";
  status: ConversationStatus;
  responsible: ConversationResponsible;
  /** Nome do atendente humano responsável, quando houver. */
  assignedOperator?: string;
  /** Pedido relacionado à conversa, quando existir. */
  orderId?: string;
  /** ISO da última atividade, usada para ordenação. */
  lastMessageAt: string;
  unreadCount: number;
  /** Assunto curto para leitura rápida na lista. */
  subject: string;
}
