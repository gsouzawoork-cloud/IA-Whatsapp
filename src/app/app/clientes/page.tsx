"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime, formatMaskedPhone } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import {
  getCustomerConversations,
  getCustomerOrders,
} from "@/modules/demo/state/selectors";
import { CONVERSATION_STATUS_LABELS } from "@/modules/conversations/labels";
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

  const selected = selectedId
    ? state.data.customers.find((c) => c.id === selectedId)
    : undefined;
  const selectedOrders = selected ? getCustomerOrders(state.data, selected.id) : [];
  const selectedConversations = selected
    ? getCustomerConversations(state.data, selected.id)
    : [];

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 lg:p-6">
      <PageHeader title="Clientes" description="Base de clientes e histórico simulado." />

      <SearchInput
        label="Buscar clientes por nome ou telefone"
        value={query}
        onChange={setQuery}
        placeholder="Buscar nome ou telefone"
      />

      {customers.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum cliente encontrado" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs text-neutral-500">
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">Telefone</th>
                <th className="px-3 py-2 font-medium">Pedidos</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">Última interação</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const orders = getCustomerOrders(state.data, customer.id);
                return (
                  <tr
                    key={customer.id}
                    className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-900/50"
                  >
                    <td className="px-3 py-2 font-medium text-neutral-100">{customer.name}</td>
                    <td className="hidden px-3 py-2 text-neutral-400 sm:table-cell">
                      {formatMaskedPhone(customer.phone)}
                    </td>
                    <td className="px-3 py-2 text-neutral-400">{orders.length}</td>
                    <td className="hidden px-3 py-2 text-xs text-neutral-500 sm:table-cell">
                      {formatDateTime(customer.lastInteractionAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedId(customer.id)}
                        className="rounded-md border border-neutral-700 px-2.5 py-1 text-xs text-neutral-200 hover:bg-neutral-800"
                      >
                        Perfil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Fechar perfil"
            className="absolute inset-0 bg-neutral-950/70"
            onClick={() => setSelectedId(null)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-neutral-800 bg-neutral-950 shadow-xl">
            <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-200"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Voltar
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-100">
                  {selected.name}
                </h2>
                <p className="text-sm text-neutral-400">
                  {formatMaskedPhone(selected.phone)}
                </p>
                {selected.tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selected.tags.map((tag) => (
                      <Badge key={tag} tone="neutral">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              {selected.addresses.length > 0 ? (
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Endereços
                  </h3>
                  <ul className="space-y-1 text-sm text-neutral-300">
                    {selected.addresses.map((address) => (
                      <li key={address.id}>
                        <span className="text-neutral-500">{address.label}: </span>
                        {address.street}, {address.number} — {address.district},{" "}
                        {address.city}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {selected.internalNote ? (
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Observação interna
                  </h3>
                  <p className="rounded-md border border-neutral-800 bg-neutral-900/40 p-2 text-sm text-neutral-300">
                    {selected.internalNote}
                  </p>
                </section>
              ) : null}

              <section>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Conversas
                </h3>
                <ul className="space-y-1">
                  {selectedConversations.map((conversation) => (
                    <li
                      key={conversation.id}
                      className="flex items-center justify-between rounded-md border border-neutral-800 px-2.5 py-1.5 text-sm"
                    >
                      <span className="truncate text-neutral-200">{conversation.subject}</span>
                      <span className="shrink-0 text-xs text-neutral-500">
                        {CONVERSATION_STATUS_LABELS[conversation.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Pedidos
                </h3>
                {selectedOrders.length === 0 ? (
                  <p className="text-sm text-neutral-500">Nenhum pedido.</p>
                ) : (
                  <ul className="space-y-1">
                    {selectedOrders.map((order) => (
                      <li
                        key={order.id}
                        className="flex items-center justify-between rounded-md border border-neutral-800 px-2.5 py-1.5 text-sm"
                      >
                        <span className="text-neutral-200">{order.number}</span>
                        <OrderStatusBadge status={order.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
