/**
 * Sub-reducer das ações de conversa.
 *
 * Toda transição passa pelas regras puras da máquina de estados. Ações inválidas
 * não alteram os dados: retornam apenas um feedback de erro.
 */

import type { Message } from "@/modules/conversations/types";
import {
  canReopenConversation,
  canResolveConversation,
  canReturnConversationToAI,
  canTakeOverConversation,
  isConversationTransitionAllowed,
} from "@/modules/conversations/domain/transitions";
import type { DemoAction, DemoState } from "../types";
import { getConversation } from "../selectors";
import {
  appendMessage,
  commit,
  fail,
  markConversationRead,
  patchConversation,
  systemMessage,
} from "./helpers";

type ConversationActionType =
  | "SELECT_CONVERSATION"
  | "SEND_MESSAGE"
  | "TAKE_OVER_CONVERSATION"
  | "RETURN_TO_AI"
  | "RESOLVE_CONVERSATION"
  | "REOPEN_CONVERSATION"
  | "TRANSFER_CONVERSATION";

type ConversationAction = Extract<DemoAction, { type: ConversationActionType }>;

export function conversationsReducer(
  state: DemoState,
  action: ConversationAction,
): DemoState {
  switch (action.type) {
    case "SELECT_CONVERSATION": {
      if (!action.conversationId) {
        return commit(state, { selectedConversationId: null });
      }
      const data = markConversationRead(state.data, action.conversationId);
      return commit(state, {
        data,
        selectedConversationId: action.conversationId,
      });
    }

    case "SEND_MESSAGE": {
      const conversation = getConversation(state.data, action.conversationId);
      if (!conversation) {
        return fail(state, "Conversa não encontrada.");
      }
      if (conversation.status === "closed") {
        return fail(state, "Não é possível enviar mensagem em conversa encerrada.");
      }
      const content = action.content.trim();
      if (!content) {
        return fail(state, "Digite uma mensagem antes de enviar.");
      }
      const message: Message = {
        id: action.meta.id,
        conversationId: conversation.id,
        authorType: "human",
        authorName: "Você",
        content,
        createdAt: action.meta.now,
        origin: "platform",
        read: true,
      };
      const data = patchConversation(
        appendMessage(state.data, message),
        conversation.id,
        { lastMessageAt: action.meta.now },
      );
      return commit(state, { data }, { kind: "success", message: "Mensagem enviada." });
    }

    case "TAKE_OVER_CONVERSATION": {
      const conversation = getConversation(state.data, action.conversationId);
      if (!conversation) {
        return fail(state, "Conversa não encontrada.");
      }
      if (!canTakeOverConversation(conversation.status)) {
        return fail(state, "Não é possível assumir esta conversa agora.");
      }
      const read = markConversationRead(state.data, conversation.id);
      const withMessage = appendMessage(
        read,
        systemMessage(
          conversation.id,
          "Atendente assumiu a conversa. IA pausada.",
          action.meta,
        ),
      );
      const data = patchConversation(withMessage, conversation.id, {
        status: "human_active",
        responsible: "human",
        assignedOperator: "Você",
        lastMessageAt: action.meta.now,
      });
      return commit(state, { data }, { kind: "success", message: "Atendimento assumido." });
    }

    case "RETURN_TO_AI": {
      const conversation = getConversation(state.data, action.conversationId);
      if (!conversation) {
        return fail(state, "Conversa não encontrada.");
      }
      if (!canReturnConversationToAI(conversation.status)) {
        return fail(state, "Esta conversa não pode ser devolvida para a IA.");
      }
      const withMessage = appendMessage(
        state.data,
        systemMessage(conversation.id, "Conversa devolvida para a IA.", action.meta),
      );
      const data = patchConversation(withMessage, conversation.id, {
        status: "ai_active",
        responsible: "ai",
        assignedOperator: undefined,
        lastMessageAt: action.meta.now,
      });
      return commit(state, { data }, { kind: "success", message: "IA retomou o atendimento." });
    }

    case "RESOLVE_CONVERSATION": {
      const conversation = getConversation(state.data, action.conversationId);
      if (!conversation) {
        return fail(state, "Conversa não encontrada.");
      }
      if (!canResolveConversation(conversation.status)) {
        return fail(state, "Esta conversa não pode ser encerrada agora.");
      }
      const withMessage = appendMessage(
        state.data,
        systemMessage(
          conversation.id,
          "Conversa encerrada (resolvida).",
          action.meta,
        ),
      );
      const data = patchConversation(withMessage, conversation.id, {
        status: "resolved",
        responsible: "none",
        assignedOperator: undefined,
        lastMessageAt: action.meta.now,
      });
      return commit(state, { data }, { kind: "success", message: "Conversa encerrada." });
    }

    case "REOPEN_CONVERSATION": {
      const conversation = getConversation(state.data, action.conversationId);
      if (!conversation) {
        return fail(state, "Conversa não encontrada.");
      }
      if (!canReopenConversation(conversation.status)) {
        return fail(state, "Apenas conversas resolvidas podem ser reabertas.");
      }
      const withMessage = appendMessage(
        state.data,
        systemMessage(conversation.id, "Conversa reaberta.", action.meta),
      );
      const data = patchConversation(withMessage, conversation.id, {
        status: "ai_active",
        responsible: "ai",
        lastMessageAt: action.meta.now,
      });
      return commit(state, { data }, { kind: "success", message: "Conversa reaberta." });
    }

    case "TRANSFER_CONVERSATION": {
      const conversation = getConversation(state.data, action.conversationId);
      if (!conversation) {
        return fail(state, "Conversa não encontrada.");
      }
      if (!isConversationTransitionAllowed(conversation.status, "transferred")) {
        return fail(state, "Esta conversa não pode ser transferida agora.");
      }
      const withMessage = appendMessage(
        state.data,
        systemMessage(
          conversation.id,
          "Conversa transferida para o setor de entregas.",
          action.meta,
        ),
      );
      const data = patchConversation(withMessage, conversation.id, {
        status: "transferred",
        responsible: "human",
        assignedOperator: "Setor de entregas",
        lastMessageAt: action.meta.now,
      });
      return commit(state, { data }, { kind: "info", message: "Conversa transferida (simulado)." });
    }
  }
}
