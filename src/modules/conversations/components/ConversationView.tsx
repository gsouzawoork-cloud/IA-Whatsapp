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
    <div className="flex h-full flex-col">
      <ConversationHeader conversation={conversation} customer={customer} onBack={onBack} />
      {onOpenContext ? (
        <div className="border-b border-neutral-800 px-3 py-1.5 lg:hidden">
          <button
            type="button"
            onClick={onOpenContext}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-300"
          >
            <PanelRightOpen className="h-3.5 w-3.5" aria-hidden />
            Ver cliente e pedido
          </button>
        </div>
      ) : null}
      <div className="flex-1 overflow-y-auto">
        <MessageThread messages={messages} />
      </div>
      <MessageComposer
        conversationId={conversation.id}
        disabled={conversation.status === "closed"}
      />
    </div>
  );
}
