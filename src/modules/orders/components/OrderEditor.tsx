"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatCurrency } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { getOrderTotals } from "@/modules/demo/state/selectors";
import { getOrderConfirmationIssues } from "../domain/validation";
import {
  canTransitionOrder,
  getNextPreparationStatus,
} from "../domain/transitions";
import { FULFILLMENT_LABELS, ORDER_STATUS_LABELS } from "../labels";
import type { FulfillmentType, Order } from "../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderItemEditor } from "./OrderItemEditor";
import { PaymentEditor } from "./PaymentEditor";
import { AddressEditor } from "./AddressEditor";

const FULFILLMENTS: readonly FulfillmentType[] = ["delivery", "pickup"];

/** Editor completo de pedido: rascunho editável e detalhe operacional. */
export function OrderEditor({ order }: { order: Order }) {
  const { state, actions } = useDemo();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { subtotalCents, totalCents } = getOrderTotals(order);
  const issues = getOrderConfirmationIssues(order, state.data.products);
  const isDraft = order.status === "draft";
  const nextStatus = getNextPreparationStatus(order.status, order.fulfillment);
  const canCancel = canTransitionOrder(order.status, "cancelled");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-100">{order.number}</span>
        <OrderStatusBadge status={order.status} />
      </div>

      {isDraft ? (
        <div className="flex gap-1.5">
          {FULFILLMENTS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => actions.setOrderFulfillment(order.id, f)}
              aria-pressed={order.fulfillment === f}
              className={`rounded-md border px-2.5 py-1.5 text-xs ${
                order.fulfillment === f
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                  : "border-neutral-800 text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              {FULFILLMENT_LABELS[f]}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-500">
          {FULFILLMENT_LABELS[order.fulfillment]}
        </p>
      )}

      <OrderItemEditor order={order} />

      {order.fulfillment === "delivery" ? (
        <div>
          <p className="mb-1 text-xs font-medium text-neutral-400">Endereço de entrega</p>
          <AddressEditor order={order} />
        </div>
      ) : null}

      <PaymentEditor order={order} />

      <div className="space-y-1 rounded-md border border-neutral-800 bg-neutral-900/40 p-3 text-sm">
        <div className="flex justify-between text-neutral-400">
          <span>Subtotal</span>
          <span className="tabular-nums text-neutral-200">
            {formatCurrency(subtotalCents)}
          </span>
        </div>
        {order.fulfillment === "delivery" ? (
          <div className="flex justify-between text-neutral-400">
            <span>Taxa de entrega</span>
            <span className="tabular-nums text-neutral-200">
              {formatCurrency(order.deliveryFeeCents)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-neutral-800 pt-1 font-semibold text-neutral-100">
          <span>Total</span>
          <span className="tabular-nums">{formatCurrency(totalCents)}</span>
        </div>
      </div>

      {isDraft ? (
        <div className="space-y-2">
          {issues.length > 0 ? (
            <ul className="space-y-1 rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-amber-200">
              {issues.map((issue) => (
                <li key={issue} className="flex items-start gap-1.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {issue}
                </li>
              ))}
            </ul>
          ) : null}
          <Button
            variant="primary"
            className="w-full"
            disabled={issues.length > 0}
            onClick={() => actions.confirmOrder(order.id)}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Confirmar pedido
          </Button>
        </div>
      ) : null}

      {nextStatus ? (
        <Button
          variant="primary"
          className="w-full"
          onClick={() => actions.advanceOrderStatus(order.id, nextStatus)}
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
          Avançar para {ORDER_STATUS_LABELS[nextStatus].toLowerCase()}
        </Button>
      ) : null}

      {canCancel ? (
        <Button
          variant="danger"
          className="w-full"
          onClick={() => setConfirmCancel(true)}
        >
          <XCircle className="h-4 w-4" aria-hidden />
          Cancelar pedido
        </Button>
      ) : null}

      <ConfirmDialog
        open={confirmCancel}
        title={`Cancelar ${order.number}?`}
        description="A disponibilidade dos itens será restaurada quando aplicável. Esta ação não pode ser desfeita."
        confirmLabel="Cancelar pedido"
        cancelLabel="Voltar"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          actions.cancelOrder(order.id);
          setConfirmCancel(false);
        }}
      />
    </div>
  );
}
