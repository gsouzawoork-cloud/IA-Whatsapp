"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  ChefHat,
  ChevronRight,
  Clock,
  PackageX,
  ShoppingBag,
  Timer,
  UserCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDuration, formatElapsed } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import {
  getOverviewMetrics,
  getRecentOrders,
  getUnavailableProducts,
} from "@/modules/demo/state/metrics";
import { getOrderTotals, listConversations } from "@/modules/demo/state/selectors";
import { getPreparationQueue } from "@/modules/preparation/domain/queue";
import { ConversationStatusBadge } from "@/modules/conversations/components/ConversationStatusBadge";
import { OrderStatusBadge } from "@/modules/orders/components/OrderStatusBadge";
import type { ConversationStatus } from "@/modules/conversations/types";

const REASON: Partial<Record<ConversationStatus, string>> = {
  new: "Nova conversa sem resposta",
  waiting_human: "Cliente pediu atendente",
};

export default function OverviewPage() {
  const { state, actions } = useDemo();
  const metrics = getOverviewMetrics(state.data);
  const priority = listConversations(state.data, "attention", "").slice(0, 5);
  const recentOrders = getRecentOrders(state.data, 5);
  const unavailable = getUnavailableProducts(state.data);
  const queue = getPreparationQueue(state.data.orders);
  const flow = [
    { label: "Confirmados", value: queue.confirmed.length },
    { label: "Preparando", value: queue.preparing.length },
    { label: "Prontos", value: queue.ready.length },
    { label: "Em entrega", value: queue.out_for_delivery.length },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
      <PageHeader
        eyebrow={`Operação · ${state.data.business.name}`}
        title="Visão geral"
        description="Panorama do momento com dados simulados, atualizado em tempo real."
        actions={
          <div className="hidden gap-2 sm:flex">
            <Link
              href="/app/atendimento"
              className="inline-flex items-center gap-1.5 rounded-lg border border-strong bg-white/[0.04] px-3 py-2 text-sm font-semibold text-hi transition-colors hover:bg-white/[0.08]"
            >
              Atendimento
              <ArrowRight className="h-4 w-4 text-accent" aria-hidden />
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Precisam de atenção"
          value={String(metrics.conversationsNeedingAttention).padStart(2, "0")}
          hint="Nova(s) + aguardando humano"
          icon={AlertCircle}
          tone="attention"
          highlight={metrics.conversationsNeedingAttention > 0}
        />
        <MetricCard
          label="IA atendendo"
          value={metrics.conversationsWithAI}
          icon={Bot}
          tone="accent"
        />
        <MetricCard
          label="Atendimento humano"
          value={metrics.activeHumanConversations}
          icon={UserCheck}
          tone="info"
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
        <SectionCard
          title="Conversas prioritárias"
          description="Ordenadas por urgência"
          action={
            <Link href="/app/atendimento" className="text-xs font-semibold text-accent hover:underline">
              Ver todas
            </Link>
          }
          bodyClassName="p-2"
        >
          {priority.length === 0 ? (
            <p className="p-4 text-sm text-low">Nenhuma conversa aguardando atenção.</p>
          ) : (
            <ul className="space-y-1">
              {priority.map((conversation) => {
                const customer = state.data.customers.find(
                  (c) => c.id === conversation.customerId,
                );
                return (
                  <li key={conversation.id}>
                    <Link
                      href="/app/atendimento"
                      onClick={() => actions.selectConversation(conversation.id)}
                      className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-line hover:bg-white/[0.03]"
                    >
                      <Avatar name={customer?.name ?? "Cliente"} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-hi">
                          {customer?.name ?? "Cliente"}
                        </p>
                        <p className="truncate text-xs text-low">
                          {REASON[conversation.status] ?? conversation.subject}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="hidden text-[11px] text-dim sm:block">
                          {formatElapsed(conversation.lastMessageAt)}
                        </span>
                        <ConversationStatusBadge status={conversation.status} />
                        <ChevronRight className="h-4 w-4 text-dim transition-transform group-hover:translate-x-0.5 group-hover:text-mid" aria-hidden />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Estado da fila"
          action={
            <Link href="/app/fila" className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
              <ChefHat className="h-3.5 w-3.5" aria-hidden />
              Abrir fila
            </Link>
          }
        >
          <div className="flex items-stretch gap-1.5">
            {flow.map((step, index) => (
              <div key={step.label} className="flex flex-1 items-center gap-1.5">
                <div className="flex-1 rounded-lg border border-line bg-white/[0.02] p-3 text-center">
                  <p className="t-kpi text-2xl">{step.value}</p>
                  <p className="mt-1 text-[11px] text-low">{step.label}</p>
                </div>
                {index < flow.length - 1 ? (
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-dim" aria-hidden />
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Pedidos recentes" bodyClassName="p-2">
          <ul className="space-y-0.5">
            {recentOrders.map((order) => {
              const customer = state.data.customers.find((c) => c.id === order.customerId);
              const { totalCents } = getOrderTotals(order);
              return (
                <li key={order.id}>
                  <Link
                    href="/app/pedidos"
                    className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="num text-sm font-bold text-hi">{order.number}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-mid">
                      {customer?.name ?? "Cliente"}
                    </span>
                    <span className="num text-sm font-semibold text-hi">
                      {formatCurrency(totalCents)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard title="Disponibilidade crítica" description="Produtos que a IA não pode oferecer agora">
          {unavailable.length === 0 ? (
            <p className="text-sm text-low">Todos os produtos disponíveis.</p>
          ) : (
            <ul className="space-y-1.5">
              {unavailable.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-2.5 rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-sm"
                >
                  <PackageX className="h-4 w-4 shrink-0 text-bad" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-mid">{product.name}</span>
                  <span className="text-xs text-low">
                    {product.availability.mode === "quantity" ? "sem estoque" : "indisponível"}
                  </span>
                  <Link href="/app/produtos" className="text-xs font-semibold text-accent hover:underline">
                    Corrigir
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
