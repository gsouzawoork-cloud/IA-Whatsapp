"use client";

import { useState } from "react";
import { PanelRight } from "lucide-react";
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
import { WorkspaceEmptyState } from "@/modules/conversations/components/WorkspaceEmptyState";

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
            <WorkspaceEmptyState />
          )}
        </div>
        <div className="border-l border-subtle">
          {conversation ? (
            <ContextPanel conversation={conversation} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface-1/40 p-6 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white/[0.03] text-low">
                <PanelRight className="h-5 w-5" aria-hidden />
              </span>
              <p className="text-sm text-low">
                O contexto do cliente — dados, pedido e histórico — aparece aqui.
              </p>
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
