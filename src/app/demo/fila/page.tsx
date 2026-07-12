"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import {
  PREPARATION_STATUSES,
  calculateEstimatedPreparationTime,
  countOrderItems,
  getPreparationQueue,
} from "@/modules/preparation/domain/queue";
import { ORDER_STATUS_LABELS } from "@/modules/orders/labels";
import { PreparationCard } from "@/modules/preparation/components/PreparationCard";

export default function FilaPage() {
  const { state } = useDemo();
  const queue = getPreparationQueue(state.data.orders);
  const activeOrders = PREPARATION_STATUSES.reduce(
    (total, status) => total + queue[status].length,
    0,
  );
  const base = state.data.business.defaultPreparationMinutes;

  return (
    <div className="animate-rise mx-auto max-w-7xl space-y-4 p-4 lg:p-8">
      <PageHeader
        eyebrow="Módulo · Fila de preparo"
        title="Fila de preparo"
        description="Avance cada pedido pelas etapas. Mudanças de status atualizam a conversa do cliente."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PREPARATION_STATUSES.map((status) => {
          const orders = queue[status];
          return (
            <section
              key={status}
              aria-label={ORDER_STATUS_LABELS[status]}
              className="flex flex-col rounded-xl border border-subtle bg-surface-1/40"
            >
              <header className="flex items-center justify-between border-b border-subtle px-3 py-2.5">
                <h2 className="t-section text-sm">{ORDER_STATUS_LABELS[status]}</h2>
                <span className="num flex h-5 min-w-5 items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-xs font-bold text-mid">
                  {orders.length}
                </span>
              </header>
              <div className="scroll-slim flex-1 space-y-2 overflow-y-auto p-2">
                {orders.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-line px-2 py-8 text-center text-xs text-dim">
                    Vazio
                  </p>
                ) : (
                  orders.map((order) => (
                    <PreparationCard
                      key={order.id}
                      order={order}
                      estimatedMinutes={calculateEstimatedPreparationTime({
                        basePreparationMinutes: base,
                        activeOrders,
                        itemCount: countOrderItems(order),
                      })}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
