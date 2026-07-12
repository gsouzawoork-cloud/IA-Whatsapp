import { describe, expect, it } from "vitest";
import {
  canReopenConversation,
  canResolveConversation,
  canReturnConversationToAI,
  canTakeOverConversation,
  transitionConversationStatus,
} from "./transitions";

describe("assumir conversa", () => {
  it("permite assumir uma conversa conduzida pela IA", () => {
    expect(canTakeOverConversation("ai_active")).toBe(true);
    expect(canTakeOverConversation("waiting_human")).toBe(true);
  });

  it("não permite assumir uma conversa encerrada", () => {
    expect(canTakeOverConversation("closed")).toBe(false);
  });
});

describe("devolver para a IA", () => {
  it("permite devolver de atendimento humano", () => {
    expect(canReturnConversationToAI("human_active")).toBe(true);
  });

  it("não devolve o que já está com a IA", () => {
    expect(canReturnConversationToAI("ai_active")).toBe(false);
  });
});

describe("resolver e reabrir", () => {
  it("permite resolver uma conversa ativa", () => {
    expect(canResolveConversation("human_active")).toBe(true);
  });

  it("permite reabrir apenas conversas resolvidas", () => {
    expect(canReopenConversation("resolved")).toBe(true);
    expect(canReopenConversation("closed")).toBe(false);
  });
});

describe("transitionConversationStatus", () => {
  it("rejeita transição inválida", () => {
    expect(transitionConversationStatus("closed", "ai_active").ok).toBe(false);
  });

  it("aceita transição válida", () => {
    expect(transitionConversationStatus("new", "ai_active").ok).toBe(true);
  });
});
