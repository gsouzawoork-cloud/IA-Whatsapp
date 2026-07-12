/**
 * Reducer raiz do estado da demonstração.
 *
 * Coordena os sub-reducers coesos por domínio, mantendo uma única fonte de
 * estado. Ações desconhecidas não alteram nada.
 */

import { createInitialDemoData } from "@/data/demo";
import type { DemoAction, DemoState } from "./types";
import { commit } from "./reducers/helpers";
import { conversationsReducer } from "./reducers/conversations";
import { ordersReducer } from "./reducers/orders";
import { catalogReducer } from "./reducers/catalog";
import { agentReducer } from "./reducers/agent";

/** Estado inicial com uma cópia nova dos dados simulados. */
export function createInitialState(): DemoState {
  return {
    data: createInitialDemoData(),
    selectedConversationId: null,
    feedback: null,
    feedbackSeq: 0,
  };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, data: action.data, selectedConversationId: null };

    case "RESTORE_DEMO":
      return commit(
        { ...createInitialState(), feedbackSeq: state.feedbackSeq },
        {},
        { kind: "info", message: "Demonstração restaurada." },
      );

    case "SELECT_CONVERSATION":
    case "SEND_MESSAGE":
    case "TAKE_OVER_CONVERSATION":
    case "RETURN_TO_AI":
    case "RESOLVE_CONVERSATION":
    case "REOPEN_CONVERSATION":
    case "TRANSFER_CONVERSATION":
      return conversationsReducer(state, action);

    case "CREATE_DRAFT_ORDER":
    case "ADD_ORDER_ITEM":
    case "REMOVE_ORDER_ITEM":
    case "UPDATE_ORDER_ITEM_QUANTITY":
    case "SET_ORDER_FULFILLMENT":
    case "SET_ORDER_ADDRESS":
    case "SET_ORDER_PAYMENT":
    case "CONFIRM_ORDER":
    case "ADVANCE_ORDER_STATUS":
    case "CANCEL_ORDER":
    case "SIMULATE_PIX_PAID":
      return ordersReducer(state, action);

    case "SET_PRODUCT_MANUAL_AVAILABILITY":
    case "SET_PRODUCT_QUANTITY":
      return catalogReducer(state, action);

    case "UPDATE_AGENT_SETTINGS":
      return agentReducer(state, action);
  }
}
