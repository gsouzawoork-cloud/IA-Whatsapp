/**
 * Sub-reducer da configuração simulada da IA.
 */

import type { DemoAction, DemoState } from "../types";
import { commit } from "./helpers";

type AgentAction = Extract<DemoAction, { type: "UPDATE_AGENT_SETTINGS" }>;

export function agentReducer(state: DemoState, action: AgentAction): DemoState {
  const data = {
    ...state.data,
    agentSettings: { ...action.settings, updatedAt: action.meta.now },
  };
  return commit(state, { data }, { kind: "success", message: "Configuração salva." });
}
