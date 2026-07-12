"use client";

import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { elapsedMinutes, formatDuration, formatElapsed } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { getNextPreparationStatus } from "@/modules/orders/domain/transitions";
import { FULFILLMENT_LABELS, PAYMENT_METHOD_LABELS } from "@/modules/orders/labels";
import type { Order, OrderStatus } from "@/modules/orders/types";

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  preparing: "Iniciar preparo",
  ready: "Marcar como pronto",
  out_for_delivery: "Saiu para entrega",
  delivered: "Concluir pedido",
};

/** Ficha operacional de um pedido na fila de preparo. */
export function PreparationCard({
  order,
  estimatedMinutes,
}: {
  order: Order;
  estimatedMinutes: number;
}) {
  const { state, actions } = useDemo();
  const customer = state.data.customers.find((c) => c.id === order.customerId);
  const next = getNextPreparationStatus(order.status, order.fulfillment);
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const summary = order.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ");

  const elapsedMin = elapsedMinutes(order.createdAt);
  // Guarda contra relógio divergente: só sinaliza atraso em janela plausível.
  const overdue = elapsedMin > estimatedMinutes && elapsedMin < 1440;

  return (
    <article
      className={`space-y-2.5 rounded-xl p-3 transition-transform duration-150 hover:-translate-y-0.5 ${
        overdue ? "panel-priority border-warn/30" : "panel elev-low"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="num text-lg font-extrabold text-hi">{order.number}</span>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
            overdue ? "border-warn/30 bg-warn/10 text-warn" : "border-line text-low"
          }`}
        >
          <Clock className="h-3 w-3" aria-hidden />
          {formatElapsed(order.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Avatar name={customer?.name ?? "Cliente"} size="sm" />
        <span className="truncate text-sm font-medium text-mid">{customer?.name ?? "Cliente"}</span>
      </div>

      <p className="text-xs leading-relaxed text-low">
        <span className="num font-semibold text-mid">{itemCount}</span>{" "}
        {itemCount === 1 ? "item" : "itens"} · {summary}
      </p>
      {order.notes ? (
        <p className="rounded-lg border border-warn/20 bg-warn/[0.07] px-2 py-1 text-[11px] text-warn">
          {order.notes}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="rounded-md border border-line bg-white/[0.03] px-1.5 py-0.5 text-low">
          {FULFILLMENT_LABELS[order.fulfillment]}
        </span>
        <span className="rounded-md border border-line bg-white/[0.03] px-1.5 py-0.5 text-low">
          {PAYMENT_METHOD_LABELS[order.payment.method]}
        </span>
        <span className="num ml-auto text-dim">~{formatDuration(estimatedMinutes)}</span>
      </div>

      {next ? (
        <Button size="sm" variant="primary" className="w-full" onClick={() => actions.advanceOrderStatus(order.id, next)}>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          {ACTION_LABEL[next] ?? "Avançar"}
        </Button>
      ) : null}
    </article>
  );
}
