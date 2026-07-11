/**
 * Tipos do estado da demonstração.
 *
 * O estado é único e coordenado, mas manipulado por sub-reducers coesos. As
 * ações que mutam dados carregam `meta` (horário e id gerados fora do reducer),
 * mantendo o reducer determinístico e livre de `Date`/`random`.
 */

import type { DemoData } from "@/data/demo";
import type { OrderAddress, OrderStatus, FulfillmentType } from "@/modules/orders/types";
import type { PaymentDetails } from "@/modules/payments/types";
import type { AgentSettings } from "@/modules/agent/types";

/** Categoria visual do feedback de uma ação. */
export type FeedbackKind = "success" | "error" | "info";

/** Feedback determinístico produzido pelo reducer para a interface exibir. */
export interface Feedback {
  readonly seq: number;
  readonly kind: FeedbackKind;
  readonly message: string;
}

/** Metadados gerados na borda (provider) para manter o reducer puro. */
export interface ActionMeta {
  readonly now: string;
  readonly id: string;
}

/** Estado completo da demonstração. */
export interface DemoState {
  readonly data: DemoData;
  readonly selectedConversationId: string | null;
  readonly feedback: Feedback | null;
  readonly feedbackSeq: number;
}

/** União fechada de todas as ações da demonstração. */
export type DemoAction =
  | { type: "SELECT_CONVERSATION"; conversationId: string | null }
  | { type: "SEND_MESSAGE"; conversationId: string; content: string; meta: ActionMeta }
  | { type: "TAKE_OVER_CONVERSATION"; conversationId: string; meta: ActionMeta }
  | { type: "RETURN_TO_AI"; conversationId: string; meta: ActionMeta }
  | { type: "RESOLVE_CONVERSATION"; conversationId: string; meta: ActionMeta }
  | { type: "REOPEN_CONVERSATION"; conversationId: string; meta: ActionMeta }
  | { type: "TRANSFER_CONVERSATION"; conversationId: string; meta: ActionMeta }
  | { type: "CREATE_DRAFT_ORDER"; conversationId: string; meta: ActionMeta }
  | {
      type: "ADD_ORDER_ITEM";
      orderId: string;
      productId: string;
      quantity: number;
      meta: ActionMeta;
    }
  | { type: "REMOVE_ORDER_ITEM"; orderId: string; itemId: string; meta: ActionMeta }
  | {
      type: "UPDATE_ORDER_ITEM_QUANTITY";
      orderId: string;
      itemId: string;
      quantity: number;
      meta: ActionMeta;
    }
  | {
      type: "SET_ORDER_FULFILLMENT";
      orderId: string;
      fulfillment: FulfillmentType;
      meta: ActionMeta;
    }
  | { type: "SET_ORDER_ADDRESS"; orderId: string; address: OrderAddress; meta: ActionMeta }
  | { type: "SET_ORDER_PAYMENT"; orderId: string; payment: PaymentDetails; meta: ActionMeta }
  | { type: "CONFIRM_ORDER"; orderId: string; meta: ActionMeta }
  | { type: "ADVANCE_ORDER_STATUS"; orderId: string; to: OrderStatus; meta: ActionMeta }
  | { type: "CANCEL_ORDER"; orderId: string; meta: ActionMeta }
  | { type: "SIMULATE_PIX_PAID"; orderId: string; meta: ActionMeta }
  | {
      type: "SET_PRODUCT_MANUAL_AVAILABILITY";
      productId: string;
      available: boolean;
      meta: ActionMeta;
    }
  | { type: "SET_PRODUCT_QUANTITY"; productId: string; quantity: number; meta: ActionMeta }
  | { type: "UPDATE_AGENT_SETTINGS"; settings: AgentSettings; meta: ActionMeta }
  | { type: "RESTORE_DEMO"; meta: ActionMeta }
  // Interna: substitui os dados pelo estado persistido após a montagem no cliente.
  | { type: "HYDRATE"; data: DemoData };
