"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterTabs, type FilterOption } from "@/components/ui/FilterTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { Drawer } from "@/components/ui/Drawer";
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

  const selected = selectedId ? state.data.orders.find((o) => o.id === selectedId) : undefined;

  return (
    <div className="animate-rise mx-auto max-w-6xl space-y-4 p-4 lg:p-8">
      <PageHeader
        eyebrow="Módulo · Pedidos"
        title="Pedidos"
        description="Acompanhe e gerencie os pedidos simulados."
      />

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
        <div className="panel elev-low overflow-hidden">
          <div className="scroll-slim overflow-x-auto">
            <table className="hidden w-full text-sm md:table">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-low">
                  <th className="px-4 py-2.5 font-semibold">Número</th>
                  <th className="px-4 py-2.5 font-semibold">Cliente</th>
                  <th className="px-4 py-2.5 font-semibold">Itens</th>
                  <th className="px-4 py-2.5 font-semibold">Total</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Pagamento</th>
                  <th className="px-4 py-2.5 font-semibold">Há</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const customer = state.data.customers.find((c) => c.id === order.customerId);
                  const { totalCents } = getOrderTotals(order);
                  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedId(order.id)}
                      className="group cursor-pointer border-b border-subtle transition-colors last:border-0 hover:bg-white/[0.03]"
                    >
                      <td className="num px-4 py-3 font-bold text-hi">{order.number}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={customer?.name ?? "—"} size="sm" />
                          <span className="text-mid">{customer?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="num px-4 py-3 text-low">{itemCount}</td>
                      <td className="num px-4 py-3 font-semibold text-hi">
                        {formatCurrency(totalCents)}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={order.payment.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-dim">{formatElapsed(order.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 rounded-md border border-line bg-white/[0.03] px-2 py-1 text-xs font-semibold text-mid transition-colors group-hover:border-accent/30 group-hover:text-accent">
                          Abrir
                          <ArrowUpRight className="h-3 w-3" aria-hidden />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards no celular. */}
          <ul className="divide-y divide-subtle md:hidden">
            {orders.map((order) => {
              const customer = state.data.customers.find((c) => c.id === order.customerId);
              const { totalCents } = getOrderTotals(order);
              return (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(order.id)}
                    className="w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="num text-sm font-bold text-hi">{order.number}</span>
                        <OrderStatusBadge status={order.status} />
                      </span>
                      <span className="num text-sm font-semibold text-hi">
                        {formatCurrency(totalCents)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Avatar name={customer?.name ?? "—"} size="sm" />
                      <span className="flex-1 truncate text-sm text-mid">{customer?.name ?? "—"}</span>
                      <PaymentStatusBadge status={order.payment.status} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `Pedido ${selected.number}` : "Pedido"}
        headerExtra={
          selected?.conversationId ? (
            <Link
              href="/demo/atendimento"
              onClick={() =>
                selected.conversationId && actions.selectConversation(selected.conversationId)
              }
              className="text-xs font-semibold text-accent hover:underline"
            >
              Ver conversa
            </Link>
          ) : null
        }
      >
        {selected ? (
          <div className="p-4">
            <OrderEditor order={selected} />
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
