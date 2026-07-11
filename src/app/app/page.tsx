"use client";

import Link from "next/link";
import {
  AlertCircle,
  Bot,
  ChefHat,
  Clock,
  PackageX,
  ShoppingBag,
  Timer,
  UserCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatDuration } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import {
  getOverviewMetrics,
  getRecentOrders,
  getUnavailableProducts,
} from "@/modules/demo/state/metrics";
import {
  getOrderTotals,
  listConversations,
} from "@/modules/demo/state/selectors";
import { getPreparationQueue } from "@/modules/preparation/domain/queue";
import { ConversationStatusBadge } from "@/modules/conversations/components/ConversationStatusBadge";
import { OrderStatusBadge } from "@/modules/orders/components/OrderStatusBadge";

export default function OverviewPage() {
  const { state, actions } = useDemo();
  const metrics = getOverviewMetrics(state.data);
  const priority = listConversations(state.data, "attention", "").slice(0, 5);
  const recentOrders = getRecentOrders(state.data, 5);
  const unavailable = getUnavailableProducts(state.data);
  const queue = getPreparationQueue(state.data.orders);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-6">
      <PageHeader
        title="Visão geral"
        description="Operação da Pizzaria Forno Alto com dados simulados."
        actions={
          <div className="hidden gap-2 sm:flex">
            <Link
              href="/app/atendimento"
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
            >
              Atendimento
            </Link>
            <Link
              href="/app/fila"
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
            >
              Fila
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard
          label="Precisam de atenção"
          value={metrics.conversationsNeedingAttention}
          icon={AlertCircle}
          highlight={metrics.conversationsNeedingAttention > 0}
        />
        <MetricCard label="IA atendendo" value={metrics.conversationsWithAI} icon={Bot} />
        <MetricCard
          label="Atendimento humano"
          value={metrics.activeHumanConversations}
          icon={UserCheck}
        />
        <MetricCard
          label="Pedidos em andamento"
          value={metrics.ordersInProgress}
          icon={ShoppingBag}
        />
        <MetricCard
          label="Aguardando confirmação"
          value={metrics.ordersAwaitingConfirmation}
          icon={Clock}
        />
        <MetricCard
          label="1ª resposta (média)"
          value={formatDuration(metrics.averageFirstResponseMinutes)}
          icon={Timer}
          hint="Simulado"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Conversas prioritárias">
          {priority.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhuma conversa aguardando atenção.</p>
          ) : (
            <ul className="space-y-2">
              {priority.map((conversation) => {
                const customer = state.data.customers.find(
                  (c) => c.id === conversation.customerId,
                );
                return (
                  <li key={conversation.id}>
                    <Link
                      href="/app/atendimento"
                      onClick={() => actions.selectConversation(conversation.id)}
                      className="flex items-center justify-between gap-2 rounded-md border border-neutral-800 px-3 py-2 hover:bg-neutral-800/60"
                    >
                      <span className="truncate text-sm text-neutral-100">
                        {customer?.name ?? "Cliente"}
                      </span>
                      <ConversationStatusBadge status={conversation.status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Resumo da fila de preparo">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <QueueStat label="Confirmados" value={queue.confirmed.length} />
            <QueueStat label="Em preparação" value={queue.preparing.length} />
            <QueueStat label="Prontos" value={queue.ready.length} />
            <QueueStat label="Em entrega" value={queue.out_for_delivery.length} />
          </div>
          <Link
            href="/app/fila"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-300"
          >
            <ChefHat className="h-3.5 w-3.5" aria-hidden />
            Abrir fila
          </Link>
        </SectionCard>

        <SectionCard title="Pedidos recentes">
          <ul className="space-y-2">
            {recentOrders.map((order) => {
              const customer = state.data.customers.find(
                (c) => c.id === order.customerId,
              );
              const { totalCents } = getOrderTotals(order);
              return (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-neutral-800 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-neutral-100">
                      {order.number} · {customer?.name ?? "Cliente"}
                    </p>
                    <p className="text-xs text-neutral-500">{formatCurrency(totalCents)}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard title="Produtos indisponíveis">
          {unavailable.length === 0 ? (
            <p className="text-sm text-neutral-500">Todos os produtos disponíveis.</p>
          ) : (
            <ul className="space-y-1.5">
              {unavailable.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-2 text-sm text-neutral-300"
                >
                  <PackageX className="h-4 w-4 shrink-0 text-red-400" aria-hidden />
                  <span className="truncate">{product.name}</span>
                  <span className="ml-auto text-xs text-neutral-500">
                    {product.availability.mode === "quantity" ? "sem estoque" : "indisponível"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function QueueStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-lg font-semibold text-neutral-100">{value}</p>
    </div>
  );
}
