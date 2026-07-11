"use client";

import { useMemo, useState } from "react";
import { Bot, User } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterTabs, type FilterOption } from "@/components/ui/FilterTabs";
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
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-neutral-800 p-3">
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

      <ul className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <li className="p-6 text-center text-sm text-neutral-500">
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
                  className={`w-full border-b border-neutral-800/60 px-3 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400/60 ${
                    selected ? "bg-neutral-800/70" : "hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 truncate text-sm font-medium text-neutral-100">
                      {conversation.responsible === "ai" ? (
                        <Bot className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-label="IA" />
                      ) : conversation.responsible === "human" ? (
                        <User className="h-3.5 w-3.5 shrink-0 text-sky-400" aria-label="Humano" />
                      ) : null}
                      <span className="truncate">{customer?.name ?? "Cliente"}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-neutral-500">
                      {formatElapsed(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-neutral-400">
                    {lastMessage?.content ?? conversation.subject}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <ConversationStatusBadge status={conversation.status} />
                    {conversation.unreadCount > 0 ? (
                      <span className="rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-neutral-950">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
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
