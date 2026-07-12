"use client";

import { useState } from "react";
import { FilePlus2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="t-eyebrow text-[10px] uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm text-hi">{children}</dd>
    </div>
  );
}

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
    <div className="flex h-full flex-col bg-surface-1/40">
      <div className="flex items-center gap-2.5 border-b border-subtle px-4 py-3">
        <Avatar name={customer.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-hi">{customer.name}</p>
          <p className="truncate text-xs text-low">{formatMaskedPhone(customer.phone)}</p>
        </div>
      </div>

      <div role="tablist" aria-label="Contexto" className="flex gap-1 border-b border-subtle px-2 pt-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`flex-1 rounded-t-lg border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tab === item.id
                ? "border-accent bg-white/[0.03] text-hi"
                : "border-transparent text-low hover:text-mid"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="scroll-slim flex-1 overflow-y-auto p-4">
        {tab === "cliente" ? (
          <dl className="space-y-3.5">
            <Field label="Endereço principal">
              {address
                ? `${address.street}, ${address.number} — ${address.district}, ${address.city}`
                : "Não informado"}
            </Field>
            {customer.tags.length > 0 ? (
              <Field label="Tags">
                <div className="mt-1 flex flex-wrap gap-1">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} tone="neutral">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Field>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-line bg-white/[0.02] p-3">
                <p className="t-kpi text-xl">{orders.length}</p>
                <p className="mt-0.5 text-[11px] text-low">Pedidos</p>
              </div>
              <div className="rounded-lg border border-line bg-white/[0.02] p-3">
                <p className="text-sm font-semibold text-hi">
                  {formatDateTime(customer.lastInteractionAt)}
                </p>
                <p className="mt-0.5 text-[11px] text-low">Última interação</p>
              </div>
            </div>
            {customer.preferences ? (
              <Field label="Preferências">{customer.preferences}</Field>
            ) : null}
            {customer.internalNote ? (
              <Field label="Observação interna">
                <span className="mt-0.5 block rounded-lg border border-line bg-white/[0.02] p-2.5 text-sm text-mid">
                  {customer.internalNote}
                </span>
              </Field>
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
                <Button variant="primary" size="sm" onClick={() => actions.createDraftOrder(conversation.id)}>
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
              <p className="t-eyebrow mb-1.5 text-[10px] uppercase">Conversas</p>
              <ul className="space-y-1">
                {conversations.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line bg-white/[0.02] px-2.5 py-1.5"
                  >
                    <span className="truncate text-mid">{c.subject}</span>
                    <span className="shrink-0 text-xs text-low">
                      {CONVERSATION_STATUS_LABELS[c.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="t-eyebrow mb-1.5 text-[10px] uppercase">Pedidos</p>
              {orders.length === 0 ? (
                <p className="text-xs text-low">Nenhum pedido.</p>
              ) : (
                <ul className="space-y-1">
                  {orders.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-line bg-white/[0.02] px-2.5 py-1.5"
                    >
                      <span className="num font-semibold text-hi">{o.number}</span>
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
