"use client";

import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDuration, formatElapsed } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { getNextPreparationStatus } from "@/modules/orders/domain/transitions";
import {
  FULFILLMENT_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/modules/orders/labels";
import type { Order } from "@/modules/orders/types";

/** Cartão operacional de um pedido na fila de preparo. */
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

  return (
    <article className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-100">{order.number}</span>
        <span className="flex items-center gap-1 text-[11px] text-neutral-500">
          <Clock className="h-3 w-3" aria-hidden />
          {formatElapsed(order.createdAt)}
        </span>
      </div>

      <p className="truncate text-xs text-neutral-400">{customer?.name ?? "Cliente"}</p>
      <p className="text-xs text-neutral-300">
        {itemCount} {itemCount === 1 ? "item" : "itens"} · {summary}
      </p>
      {order.notes ? (
        <p className="rounded bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200">
          {order.notes}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral">{FULFILLMENT_LABELS[order.fulfillment]}</Badge>
        <Badge tone="neutral">{PAYMENT_METHOD_LABELS[order.payment.method]}</Badge>
        <span className="text-[11px] text-neutral-500">
          ~{formatDuration(estimatedMinutes)}
        </span>
      </div>

      {next ? (
        <Button
          size="sm"
          variant="primary"
          className="w-full"
          onClick={() => actions.advanceOrderStatus(order.id, next)}
        >
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          {ORDER_STATUS_LABELS[next]}
        </Button>
      ) : null}
    </article>
  );
}
