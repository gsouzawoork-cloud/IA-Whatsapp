"use client";

import { useState } from "react";
import { MessagesSquare, X } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import {
  getConversation,
  getConversationMessages,
  getCustomer,
} from "@/modules/demo/state/selectors";
import { ConversationList } from "@/modules/conversations/components/ConversationList";
import { ConversationView } from "@/modules/conversations/components/ConversationView";
import { ContextPanel } from "@/modules/conversations/components/ContextPanel";

export default function AtendimentoPage() {
  const { state, actions } = useDemo();
  const [contextOpen, setContextOpen] = useState(false);

  const conversation = getConversation(state.data, state.selectedConversationId);
  const customer = conversation
    ? getCustomer(state.data, conversation.customerId)
    : undefined;
  const messages = conversation
    ? getConversationMessages(state.data, conversation.id)
    : [];

  return (
    <div className="h-full">
      {/* Desktop: três áreas simultâneas. */}
      <div className="hidden h-full lg:grid lg:grid-cols-[20rem_minmax(0,1fr)_24rem]">
        <div className="border-r border-neutral-800">
          <ConversationList />
        </div>
        <div className="min-w-0">
          {conversation ? (
            <ConversationView
              conversation={conversation}
              customer={customer}
              messages={messages}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <EmptyState
                icon={MessagesSquare}
                title="Selecione uma conversa"
                description="Escolha uma conversa na lista para ver as mensagens e o contexto do cliente."
              />
            </div>
          )}
        </div>
        <div className="border-l border-neutral-800">
          {conversation ? (
            <ContextPanel conversation={conversation} />
          ) : (
            <div className="p-6 text-center text-sm text-neutral-500">
              O contexto do cliente aparece aqui.
            </div>
          )}
        </div>
      </div>

      {/* Mobile/tablet: uma etapa por tela. */}
      <div className="h-full lg:hidden">
        {!conversation ? (
          <ConversationList />
        ) : (
          <ConversationView
            conversation={conversation}
            customer={customer}
            messages={messages}
            onBack={() => actions.selectConversation(null)}
            onOpenContext={() => setContextOpen(true)}
          />
        )}

        {conversation && contextOpen ? (
          <div className="fixed inset-0 z-40">
            <button
              type="button"
              aria-label="Fechar contexto"
              className="absolute inset-0 bg-neutral-950/70"
              onClick={() => setContextOpen(false)}
            />
            <div className="absolute inset-y-0 right-0 flex w-[92%] max-w-sm flex-col bg-neutral-950 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2">
                <span className="text-sm font-semibold text-neutral-100">Contexto</span>
                <button
                  type="button"
                  aria-label="Fechar"
                  onClick={() => setContextOpen(false)}
                  className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-800"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ContextPanel conversation={conversation} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
