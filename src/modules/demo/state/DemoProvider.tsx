"use client";

/**
 * Provider do estado da demonstração.
 *
 * Une o reducer puro à borda do React: gera `meta` (horário/id) fora do reducer,
 * persiste em `localStorage` após a montagem e traduz o feedback determinístico
 * do estado em toasts. Expõe ações já vinculadas via `useDemo`.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { OrderAddress, OrderStatus, FulfillmentType } from "@/modules/orders/types";
import type { PaymentDetails } from "@/modules/payments/types";
import type { AgentSettings } from "@/modules/agent/types";
import { ToastViewport, type ToastItem } from "@/components/ui/Toast";
import { createInitialState, demoReducer } from "./reducer";
import type { ActionMeta, DemoState } from "./types";
import {
  clearPersistedData,
  loadPersistedData,
  savePersistedData,
} from "./persistence";

/** Ações da demonstração já vinculadas ao dispatch. */
export interface DemoActions {
  selectConversation(id: string | null): void;
  sendMessage(conversationId: string, content: string): void;
  takeOver(conversationId: string): void;
  returnToAI(conversationId: string): void;
  resolveConversation(conversationId: string): void;
  reopenConversation(conversationId: string): void;
  transferConversation(conversationId: string): void;
  createDraftOrder(conversationId: string): void;
  addOrderItem(orderId: string, productId: string, quantity: number): void;
  removeOrderItem(orderId: string, itemId: string): void;
  updateOrderItemQuantity(orderId: string, itemId: string, quantity: number): void;
  setOrderFulfillment(orderId: string, fulfillment: FulfillmentType): void;
  setOrderAddress(orderId: string, address: OrderAddress): void;
  setOrderPayment(orderId: string, payment: PaymentDetails): void;
  confirmOrder(orderId: string): void;
  advanceOrderStatus(orderId: string, to: OrderStatus): void;
  cancelOrder(orderId: string): void;
  simulatePixPaid(orderId: string): void;
  setProductManualAvailability(productId: string, available: boolean): void;
  setProductQuantity(productId: string, quantity: number): void;
  updateAgentSettings(settings: AgentSettings): void;
  restoreDemo(): void;
}

interface DemoContextValue {
  readonly state: DemoState;
  readonly actions: DemoActions;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function nextMeta(): ActionMeta {
  return { now: new Date().toISOString(), id: generateId() };
}

const TOAST_TIMEOUT_MS = 3500;

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, createInitialState);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const lastFeedbackSeq = useRef(0);
  // Ref (não estado) para não disparar re-render e evitar setState dentro de efeito.
  const hydratedRef = useRef(false);

  // Carrega o estado persistido apenas no cliente, evitando divergência de hidratação.
  useEffect(() => {
    const persisted = loadPersistedData();
    if (persisted) {
      dispatch({ type: "HYDRATE", data: persisted });
    }
    hydratedRef.current = true;
  }, []);

  // Persiste alterações somente após a hidratação inicial.
  useEffect(() => {
    if (hydratedRef.current) {
      savePersistedData(state.data);
    }
  }, [state.data]);

  // Traduz o feedback do estado em um toast (uma vez por sequência).
  useEffect(() => {
    const feedback = state.feedback;
    if (!feedback || feedback.seq === lastFeedbackSeq.current) {
      return;
    }
    lastFeedbackSeq.current = feedback.seq;
    const item: ToastItem = {
      seq: feedback.seq,
      kind: feedback.kind,
      message: feedback.message,
    };
    setToasts((current) => [...current, item]);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.seq !== item.seq));
    }, TOAST_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [state.feedback]);

  const dismissToast = useCallback((seq: number) => {
    setToasts((current) => current.filter((t) => t.seq !== seq));
  }, []);

  const actions = useMemo<DemoActions>(
    () => ({
      selectConversation: (id) =>
        dispatch({ type: "SELECT_CONVERSATION", conversationId: id }),
      sendMessage: (conversationId, content) =>
        dispatch({ type: "SEND_MESSAGE", conversationId, content, meta: nextMeta() }),
      takeOver: (conversationId) =>
        dispatch({ type: "TAKE_OVER_CONVERSATION", conversationId, meta: nextMeta() }),
      returnToAI: (conversationId) =>
        dispatch({ type: "RETURN_TO_AI", conversationId, meta: nextMeta() }),
      resolveConversation: (conversationId) =>
        dispatch({ type: "RESOLVE_CONVERSATION", conversationId, meta: nextMeta() }),
      reopenConversation: (conversationId) =>
        dispatch({ type: "REOPEN_CONVERSATION", conversationId, meta: nextMeta() }),
      transferConversation: (conversationId) =>
        dispatch({ type: "TRANSFER_CONVERSATION", conversationId, meta: nextMeta() }),
      createDraftOrder: (conversationId) =>
        dispatch({ type: "CREATE_DRAFT_ORDER", conversationId, meta: nextMeta() }),
      addOrderItem: (orderId, productId, quantity) =>
        dispatch({ type: "ADD_ORDER_ITEM", orderId, productId, quantity, meta: nextMeta() }),
      removeOrderItem: (orderId, itemId) =>
        dispatch({ type: "REMOVE_ORDER_ITEM", orderId, itemId, meta: nextMeta() }),
      updateOrderItemQuantity: (orderId, itemId, quantity) =>
        dispatch({
          type: "UPDATE_ORDER_ITEM_QUANTITY",
          orderId,
          itemId,
          quantity,
          meta: nextMeta(),
        }),
      setOrderFulfillment: (orderId, fulfillment) =>
        dispatch({ type: "SET_ORDER_FULFILLMENT", orderId, fulfillment, meta: nextMeta() }),
      setOrderAddress: (orderId, address) =>
        dispatch({ type: "SET_ORDER_ADDRESS", orderId, address, meta: nextMeta() }),
      setOrderPayment: (orderId, payment) =>
        dispatch({ type: "SET_ORDER_PAYMENT", orderId, payment, meta: nextMeta() }),
      confirmOrder: (orderId) =>
        dispatch({ type: "CONFIRM_ORDER", orderId, meta: nextMeta() }),
      advanceOrderStatus: (orderId, to) =>
        dispatch({ type: "ADVANCE_ORDER_STATUS", orderId, to, meta: nextMeta() }),
      cancelOrder: (orderId) =>
        dispatch({ type: "CANCEL_ORDER", orderId, meta: nextMeta() }),
      simulatePixPaid: (orderId) =>
        dispatch({ type: "SIMULATE_PIX_PAID", orderId, meta: nextMeta() }),
      setProductManualAvailability: (productId, available) =>
        dispatch({
          type: "SET_PRODUCT_MANUAL_AVAILABILITY",
          productId,
          available,
          meta: nextMeta(),
        }),
      setProductQuantity: (productId, quantity) =>
        dispatch({ type: "SET_PRODUCT_QUANTITY", productId, quantity, meta: nextMeta() }),
      updateAgentSettings: (settings) =>
        dispatch({ type: "UPDATE_AGENT_SETTINGS", settings, meta: nextMeta() }),
      restoreDemo: () => {
        clearPersistedData();
        dispatch({ type: "RESTORE_DEMO", meta: nextMeta() });
      },
    }),
    [],
  );

  const value = useMemo<DemoContextValue>(() => ({ state, actions }), [state, actions]);

  return (
    <DemoContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </DemoContext.Provider>
  );
}

/** Acesso ao estado e às ações da demonstração. */
export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo deve ser usado dentro de <DemoProvider>.");
  }
  return context;
}
