"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterTabs, type FilterOption } from "@/components/ui/FilterTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatElapsed } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { getOrderTotals } from "@/modules/demo/state/selectors";
import { OrderEditor } from "@/modules/orders/components/OrderEditor";
import { OrderStatusBadge } from "@/modules/orders/components/OrderStatusBadge";
import { PaymentStatusBadge } from "@/modules/orders/components/PaymentStatusBadge";
import type { OrderStatus } from "@/modules/orders/types";

type StatusFilter = OrderStatus | "all";

const STATUS_FILTERS: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Rascunho" },
  { value: "awaiting_payment", label: "Aguard. pagamento" },
  { value: "confirmed", label: "Confirmados" },
  { value: "preparing", label: "Em preparação" },
  { value: "ready", label: "Prontos" },
  { value: "out_for_delivery", label: "Em entrega" },
  { value: "delivered", label: "Entregues" },
  { value: "cancelled", label: "Cancelados" },
];

export default function PedidosPage() {
  const { state, actions } = useDemo();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const orders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...state.data.orders]
      .filter((order) => {
        if (status !== "all" && order.status !== status) {
          return false;
        }
        if (!normalized) {
          return true;
        }
        const customer = state.data.customers.find((c) => c.id === order.customerId);
        return (
          order.number.toLowerCase().includes(normalized) ||
          (customer?.name.toLowerCase().includes(normalized) ?? false)
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state.data.orders, state.data.customers, status, query]);

  const options: FilterOption<StatusFilter>[] = STATUS_FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count:
      f.value === "all"
        ? state.data.orders.length
        : state.data.orders.filter((o) => o.status === f.value).length,
  }));

  const selected = selectedId
    ? state.data.orders.find((o) => o.id === selectedId)
    : undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 lg:p-6">
      <PageHeader title="Pedidos" description="Acompanhe e gerencie os pedidos simulados." />

      <div className="space-y-3">
        <SearchInput
          label="Buscar pedidos por número ou cliente"
          value={query}
          onChange={setQuery}
          placeholder="Buscar número ou cliente"
        />
        <FilterTabs
          ariaLabel="Filtrar pedidos por status"
          options={options}
          value={status}
          onChange={setStatus}
        />
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Nenhum pedido encontrado" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="hidden w-full text-sm md:table">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs text-neutral-500">
                <th className="px-3 py-2 font-medium">Número</th>
                <th className="px-3 py-2 font-medium">Cliente</th>
                <th className="px-3 py-2 font-medium">Itens</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Pagamento</th>
                <th className="px-3 py-2 font-medium">Há</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const customer = state.data.customers.find(
                  (c) => c.id === order.customerId,
                );
                const { totalCents } = getOrderTotals(order);
                const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
                return (
                  <tr
                    key={order.id}
                    className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-900/50"
                  >
                    <td className="px-3 py-2 font-medium text-neutral-100">{order.number}</td>
                    <td className="px-3 py-2 text-neutral-300">{customer?.name ?? "—"}</td>
                    <td className="px-3 py-2 text-neutral-400">{itemCount}</td>
                    <td className="px-3 py-2 tabular-nums text-neutral-200">
                      {formatCurrency(totalCents)}
                    </td>
                    <td className="px-3 py-2">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-3 py-2">
                      <PaymentStatusBadge status={order.payment.status} />
                    </td>
                    <td className="px-3 py-2 text-xs text-neutral-500">
                      {formatElapsed(order.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedId(order.id)}
                        className="rounded-md border border-neutral-700 px-2.5 py-1 text-xs text-neutral-200 hover:bg-neutral-800"
                      >
                        Abrir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Cards no celular. */}
          <ul className="divide-y divide-neutral-800 md:hidden">
            {orders.map((order) => {
              const customer = state.data.customers.find(
                (c) => c.id === order.customerId,
              );
              const { totalCents } = getOrderTotals(order);
              return (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(order.id)}
                    className="w-full px-3 py-3 text-left hover:bg-neutral-900/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-100">
                        {order.number} · {customer?.name ?? "—"}
                      </span>
                      <span className="text-sm tabular-nums text-neutral-200">
                        {formatCurrency(totalCents)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <PaymentStatusBadge status={order.payment.status} />
                      <span className="ml-auto text-xs text-neutral-500">
                        {formatElapsed(order.createdAt)}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Detalhe do pedido selecionado. */}
      {selected ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Fechar detalhe"
            className="absolute inset-0 bg-neutral-950/70"
            onClick={() => setSelectedId(null)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-neutral-800 bg-neutral-950 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-200"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Voltar
              </button>
              {selected.conversationId ? (
                <Link
                  href="/app/atendimento"
                  onClick={() =>
                    selected.conversationId &&
                    actions.selectConversation(selected.conversationId)
                  }
                  className="text-xs text-emerald-300 hover:underline"
                >
                  Ver conversa
                </Link>
              ) : null}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <OrderEditor order={selected} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
