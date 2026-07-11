"use client";

import { useState } from "react";
import { FilePlus2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime, formatMaskedPhone } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import {
  getCustomerConversations,
  getCustomerOrders,
  getOrder,
} from "@/modules/demo/state/selectors";
import { OrderEditor } from "@/modules/orders/components/OrderEditor";
import { OrderStatusBadge } from "@/modules/orders/components/OrderStatusBadge";
import { CONVERSATION_STATUS_LABELS } from "../labels";
import type { Conversation } from "../types";

type Tab = "cliente" | "pedido" | "historico";

const TABS: readonly { id: Tab; label: string }[] = [
  { id: "cliente", label: "Cliente" },
  { id: "pedido", label: "Pedido" },
  { id: "historico", label: "Histórico" },
];

/** Painel de contexto do cliente e da operação, em abas compactas. */
export function ContextPanel({ conversation }: { conversation: Conversation }) {
  const { state, actions } = useDemo();
  const [tab, setTab] = useState<Tab>("cliente");
  const customer = state.data.customers.find((c) => c.id === conversation.customerId);
  const order = getOrder(state.data, conversation.orderId);

  if (!customer) {
    return null;
  }

  const orders = getCustomerOrders(state.data, customer.id);
  const conversations = getCustomerConversations(state.data, customer.id);
  const address = customer.addresses[0];

  return (
    <div className="flex h-full flex-col">
      <div
        role="tablist"
        aria-label="Contexto"
        className="flex border-b border-neutral-800"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`flex-1 border-b-2 px-3 py-2.5 text-sm transition-colors ${
              tab === item.id
                ? "border-emerald-500 font-medium text-neutral-100"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "cliente" ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-neutral-500">Nome</dt>
              <dd className="text-neutral-100">{customer.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Telefone</dt>
              <dd className="text-neutral-100">{formatMaskedPhone(customer.phone)}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Endereço principal</dt>
              <dd className="text-neutral-200">
                {address
                  ? `${address.street}, ${address.number} — ${address.district}, ${address.city}`
                  : "Não informado"}
              </dd>
            </div>
            {customer.tags.length > 0 ? (
              <div>
                <dt className="text-xs text-neutral-500">Tags</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} tone="neutral">
                      {tag}
                    </Badge>
                  ))}
                </dd>
              </div>
            ) : null}
            <div className="flex gap-6">
              <div>
                <dt className="text-xs text-neutral-500">Pedidos</dt>
                <dd className="text-neutral-100">{orders.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Última interação</dt>
                <dd className="text-neutral-200">
                  {formatDateTime(customer.lastInteractionAt)}
                </dd>
              </div>
            </div>
            {customer.preferences ? (
              <div>
                <dt className="text-xs text-neutral-500">Preferências</dt>
                <dd className="text-neutral-200">{customer.preferences}</dd>
              </div>
            ) : null}
            {customer.internalNote ? (
              <div>
                <dt className="text-xs text-neutral-500">Observação interna</dt>
                <dd className="rounded-md border border-neutral-800 bg-neutral-900/40 p-2 text-neutral-300">
                  {customer.internalNote}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {tab === "pedido" ? (
          order ? (
            <OrderEditor order={order} />
          ) : (
            <EmptyState
              icon={FilePlus2}
              title="Sem pedido nesta conversa"
              description="Crie um rascunho para começar a montar o pedido do cliente."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => actions.createDraftOrder(conversation.id)}
                >
                  <FilePlus2 className="h-3.5 w-3.5" aria-hidden />
                  Criar rascunho
                </Button>
              }
            />
          )
        ) : null}

        {tab === "historico" ? (
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Conversas
              </p>
              <ul className="space-y-1">
                {conversations.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-md border border-neutral-800 px-2.5 py-1.5"
                  >
                    <span className="truncate text-neutral-200">{c.subject}</span>
                    <span className="shrink-0 text-xs text-neutral-500">
                      {CONVERSATION_STATUS_LABELS[c.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Pedidos
              </p>
              {orders.length === 0 ? (
                <p className="text-xs text-neutral-500">Nenhum pedido.</p>
              ) : (
                <ul className="space-y-1">
                  {orders.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between rounded-md border border-neutral-800 px-2.5 py-1.5"
                    >
                      <span className="text-neutral-200">{o.number}</span>
                      <OrderStatusBadge status={o.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
