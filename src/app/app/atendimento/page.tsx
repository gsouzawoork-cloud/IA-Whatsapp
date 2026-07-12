"use client";

import { useState } from "react";
import { MessagesSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Drawer } from "@/components/ui/Drawer";
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
      {/* Desktop: três áreas com profundidades distintas. */}
      <div className="hidden h-full lg:grid lg:grid-cols-[20rem_minmax(0,1fr)_23rem]">
        <div className="border-r border-subtle">
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
            <div className="flex h-full items-center justify-center bg-raised/50 p-8">
              <EmptyState
                icon={MessagesSquare}
                title="Selecione uma conversa"
                description="Escolha uma conversa na lista para ver as mensagens e o contexto do cliente."
              />
            </div>
          )}
        </div>
        <div className="border-l border-subtle">
          {conversation ? (
            <ContextPanel conversation={conversation} />
          ) : (
            <div className="flex h-full items-center justify-center bg-surface-1/40 p-6 text-center text-sm text-low">
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

        {conversation ? (
          <Drawer
            open={contextOpen}
            onClose={() => setContextOpen(false)}
            title="Contexto"
            width="max-w-sm"
          >
            <ContextPanel conversation={conversation} />
          </Drawer>
        ) : null}
      </div>
    </div>
  );
}
