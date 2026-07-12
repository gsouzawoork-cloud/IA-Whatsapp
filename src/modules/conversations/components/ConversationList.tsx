"use client";

import { useMemo, useState } from "react";
import { Bot, User } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterTabs, type FilterOption } from "@/components/ui/FilterTabs";
import { Avatar } from "@/components/ui/Avatar";
import { formatElapsed } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import {
  listConversations,
  type ConversationFilter,
} from "@/modules/demo/state/selectors";
import { ConversationStatusBadge } from "./ConversationStatusBadge";

const FILTERS: readonly { value: ConversationFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "attention", label: "Atenção" },
  { value: "ai", label: "IA" },
  { value: "human", label: "Humano" },
  { value: "waiting_customer", label: "Aguardando" },
  { value: "resolved", label: "Resolvidas" },
];

/** Lista de conversas com busca, filtros e seleção. */
export function ConversationList() {
  const { state, actions } = useDemo();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");

  const conversations = useMemo(
    () => listConversations(state.data, filter, query),
    [state.data, filter, query],
  );

  const options: FilterOption<ConversationFilter>[] = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: listConversations(state.data, f.value, "").length,
  }));

  return (
    <div className="flex h-full flex-col bg-surface-1/40">
      <div className="space-y-3 border-b border-subtle p-3">
        <SearchInput
          label="Buscar conversas por nome, telefone ou assunto"
          value={query}
          onChange={setQuery}
          placeholder="Buscar nome, telefone ou assunto"
        />
        <FilterTabs
          ariaLabel="Filtrar conversas"
          options={options}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <ul className="scroll-slim flex-1 space-y-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <li className="p-6 text-center text-sm text-low">
            Nenhuma conversa encontrada.
          </li>
        ) : (
          conversations.map((conversation) => {
            const customer = state.data.customers.find(
              (c) => c.id === conversation.customerId,
            );
            const lastMessage = state.data.messages
              .filter((m) => m.conversationId === conversation.id)
              .at(-1);
            const selected = state.selectedConversationId === conversation.id;
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => actions.selectConversation(conversation.id)}
                  aria-current={selected ? "true" : undefined}
                  className={`relative w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                    selected
                      ? "panel-priority translate-x-0.5 border-accent/30"
                      : "border-transparent hover:border-line hover:bg-white/[0.03]"
                  }`}
                >
                  {selected ? (
                    <span
                      className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-accent shadow-[0_0_8px_rgba(114,214,173,0.8)]"
                      aria-hidden
                    />
                  ) : null}
                  <div className="flex items-start gap-2.5">
                    <div className="relative">
                      <Avatar name={customer?.name ?? "Cliente"} size="sm" />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-surface-1 ${
                          conversation.responsible === "ai"
                            ? "bg-accent-soft text-accent"
                            : conversation.responsible === "human"
                              ? "bg-info/20 text-info"
                              : "bg-white/[0.06] text-low"
                        }`}
                        title={
                          conversation.responsible === "ai"
                            ? "IA atendendo"
                            : conversation.responsible === "human"
                              ? "Atendente"
                              : "Sem responsável"
                        }
                      >
                        {conversation.responsible === "ai" ? (
                          <Bot className="h-2.5 w-2.5" aria-hidden />
                        ) : conversation.responsible === "human" ? (
                          <User className="h-2.5 w-2.5" aria-hidden />
                        ) : null}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-hi">
                          {customer?.name ?? "Cliente"}
                        </span>
                        <span className="shrink-0 text-[11px] text-dim">
                          {formatElapsed(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-low">
                        {lastMessage?.content ?? conversation.subject}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <ConversationStatusBadge status={conversation.status} />
                        {conversation.unreadCount > 0 ? (
                          <span className="num flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-[#06231a]">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
