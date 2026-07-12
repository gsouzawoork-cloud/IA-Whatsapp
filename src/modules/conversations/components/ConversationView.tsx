"use client";

import { PanelRightOpen } from "lucide-react";
import type { Conversation, Message } from "../types";
import type { Customer } from "@/modules/customers/types";
import { ConversationHeader } from "./ConversationHeader";
import { MessageThread } from "./MessageThread";
import { MessageComposer } from "./MessageComposer";

/** Conversa completa: cabeçalho, histórico e caixa de mensagem. */
export function ConversationView({
  conversation,
  customer,
  messages,
  onBack,
  onOpenContext,
}: {
  conversation: Conversation;
  customer: Customer | undefined;
  messages: readonly Message[];
  onBack?: () => void;
  onOpenContext?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-raised/60">
      <ConversationHeader conversation={conversation} customer={customer} onBack={onBack} />
      {onOpenContext ? (
        <div className="border-b border-subtle px-3 py-1.5 lg:hidden">
          <button
            type="button"
            onClick={onOpenContext}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent"
          >
            <PanelRightOpen className="h-3.5 w-3.5" aria-hidden />
            Ver cliente e pedido
          </button>
        </div>
      ) : null}
      <div className="scroll-slim flex-1 overflow-y-auto">
        <MessageThread messages={messages} />
      </div>
      <MessageComposer
        conversationId={conversation.id}
        disabled={conversation.status === "closed"}
        aiActive={conversation.responsible === "ai"}
      />
    </div>
  );
}
