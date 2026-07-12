"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Drawer } from "@/components/ui/Drawer";
import { formatMaskedPhone } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import {
  getCustomerConversations,
  getCustomerOrders,
} from "@/modules/demo/state/selectors";
import { CONVERSATION_STATUS_LABELS } from "@/modules/conversations/labels";
import { ConversationStatusBadge } from "@/modules/conversations/components/ConversationStatusBadge";
import { OrderStatusBadge } from "@/modules/orders/components/OrderStatusBadge";

export default function ClientesPage() {
  const { state } = useDemo();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const customers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.data.customers.filter(
      (customer) =>
        !normalized ||
        customer.name.toLowerCase().includes(normalized) ||
        customer.phone.includes(normalized),
    );
  }, [state.data.customers, query]);

  const selected = selectedId ? state.data.customers.find((c) => c.id === selectedId) : undefined;
  const selectedOrders = selected ? getCustomerOrders(state.data, selected.id) : [];
  const selectedConversations = selected ? getCustomerConversations(state.data, selected.id) : [];

  return (
    <div className="animate-rise mx-auto max-w-5xl space-y-4 p-4 lg:p-8">
      <PageHeader
        eyebrow="Núcleo · Clientes"
        title="Clientes"
        description="Base de clientes e histórico simulado."
      />

      <SearchInput
        label="Buscar clientes por nome ou telefone"
        value={query}
        onChange={setQuery}
        placeholder="Buscar nome ou telefone"
      />

      {customers.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum cliente encontrado" />
      ) : (
        <div className="panel elev-low overflow-hidden">
          <div className="scroll-slim overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-low">
                  <th className="px-4 py-2.5 font-semibold">Cliente</th>
                  <th className="hidden px-4 py-2.5 font-semibold md:table-cell">Tags</th>
                  <th className="px-4 py-2.5 font-semibold">Pedidos</th>
                  <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">Última conversa</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const orders = getCustomerOrders(state.data, customer.id);
                  const lastConversation = getCustomerConversations(state.data, customer.id)[0];
                  return (
                    <tr
                      key={customer.id}
                      onClick={() => setSelectedId(customer.id)}
                      className="group cursor-pointer border-b border-subtle transition-colors last:border-0 hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={customer.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-hi">{customer.name}</p>
                            <p className="truncate text-xs text-low">
                              {formatMaskedPhone(customer.phone)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} tone="neutral">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="num px-4 py-3 text-mid">{orders.length}</td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        {lastConversation ? (
                          <ConversationStatusBadge status={lastConversation.status} />
                        ) : (
                          <span className="text-xs text-dim">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 rounded-md border border-line bg-white/[0.03] px-2 py-1 text-xs font-semibold text-mid transition-colors group-hover:border-accent/30 group-hover:text-accent">
                          Perfil
                          <ArrowUpRight className="h-3 w-3" aria-hidden />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Perfil do cliente"
      >
        {selected ? (
          <div className="space-y-5 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={selected.name} size="lg" />
              <div className="min-w-0">
                <h2 className="text-base font-bold text-hi">{selected.name}</h2>
                <p className="text-sm text-low">{formatMaskedPhone(selected.phone)}</p>
              </div>
            </div>

            {selected.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selected.tags.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            {selected.addresses.length > 0 ? (
              <section>
                <p className="t-eyebrow mb-1.5 text-[10px] uppercase">Endereços</p>
                <ul className="space-y-1 text-sm text-mid">
                  {selected.addresses.map((address) => (
                    <li key={address.id} className="rounded-lg border border-line bg-white/[0.02] px-3 py-2">
                      <span className="text-low">{address.label}: </span>
                      {address.street}, {address.number} — {address.district}, {address.city}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {selected.internalNote ? (
              <section>
                <p className="t-eyebrow mb-1.5 text-[10px] uppercase">Observação interna</p>
                <p className="rounded-lg border border-line bg-white/[0.02] p-2.5 text-sm text-mid">
                  {selected.internalNote}
                </p>
              </section>
            ) : null}

            <section>
              <p className="t-eyebrow mb-1.5 text-[10px] uppercase">Conversas</p>
              <ul className="space-y-1">
                {selectedConversations.map((conversation) => (
                  <li
                    key={conversation.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line bg-white/[0.02] px-2.5 py-1.5 text-sm"
                  >
                    <span className="truncate text-mid">{conversation.subject}</span>
                    <span className="shrink-0 text-xs text-low">
                      {CONVERSATION_STATUS_LABELS[conversation.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <p className="t-eyebrow mb-1.5 text-[10px] uppercase">Pedidos</p>
              {selectedOrders.length === 0 ? (
                <p className="text-sm text-low">Nenhum pedido.</p>
              ) : (
                <ul className="space-y-1">
                  {selectedOrders.map((order) => (
                    <li
                      key={order.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-line bg-white/[0.02] px-2.5 py-1.5 text-sm"
                    >
                      <span className="num font-semibold text-hi">{order.number}</span>
                      <OrderStatusBadge status={order.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
