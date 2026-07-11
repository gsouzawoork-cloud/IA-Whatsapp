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
    <div className="mx-auto max-w-6xl space-y-4 p-4 lg:p-6">
      <PageHeader
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
              className="rounded-lg border border-neutral-800 bg-neutral-950"
            >
              <header className="flex items-center justify-between border-b border-neutral-800 px-3 py-2">
                <h2 className="text-sm font-semibold text-neutral-200">
                  {ORDER_STATUS_LABELS[status]}
                </h2>
                <span className="rounded-full bg-neutral-800 px-2 text-xs text-neutral-400">
                  {orders.length}
                </span>
              </header>
              <div className="space-y-2 p-2">
                {orders.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-neutral-600">
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
