"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatCurrency, formatTime } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { getOrderDeliveryQuote, getOrderTotals } from "@/modules/demo/state/selectors";
import { getOrderConfirmationIssues } from "../domain/validation";
import { canTransitionOrder, getNextPreparationStatus } from "../domain/transitions";
import { FULFILLMENT_LABELS, ORDER_STATUS_LABELS } from "../labels";
import type { FulfillmentType, Order } from "../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderItemEditor } from "./OrderItemEditor";
import { PaymentEditor } from "./PaymentEditor";
import { AddressEditor } from "./AddressEditor";

const FULFILLMENTS: readonly FulfillmentType[] = ["delivery", "pickup"];

function Label({ children }: { children: React.ReactNode }) {
  return <p className="t-eyebrow mb-1.5 text-[10px] uppercase">{children}</p>;
}

/** Editor completo de pedido: rascunho editável e detalhe operacional. */
export function OrderEditor({ order }: { order: Order }) {
  const { state, actions } = useDemo();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { subtotalCents, totalCents } = getOrderTotals(order);
  const issues = getOrderConfirmationIssues(
    order,
    state.data.products,
    state.data.deliveryZones,
  );
  const deliveryQuote = getOrderDeliveryQuote(state.data, order);
  const outOfArea =
    order.fulfillment === "delivery" && Boolean(order.address) && !deliveryQuote;
  const isDraft = order.status === "draft";
  const nextStatus = getNextPreparationStatus(order.status, order.fulfillment);
  const canCancel = canTransitionOrder(order.status, "cancelled");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="num text-base font-bold text-hi">{order.number}</span>
        <OrderStatusBadge status={order.status} />
      </div>

      <div>
        {isDraft ? (
          <div className="grid grid-cols-2 gap-1.5">
            {FULFILLMENTS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => actions.setOrderFulfillment(order.id, f)}
                aria-pressed={order.fulfillment === f}
                className={`rounded-lg border px-2.5 py-2 text-center text-xs font-semibold transition-colors ${
                  order.fulfillment === f
                    ? "border-accent/40 bg-accent-soft text-accent"
                    : "border-line text-mid hover:bg-white/[0.05]"
                }`}
              >
                {FULFILLMENT_LABELS[f]}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-low">{FULFILLMENT_LABELS[order.fulfillment]}</p>
        )}
      </div>

      <div>
        <Label>Itens</Label>
        <OrderItemEditor order={order} />
      </div>

      {order.fulfillment === "delivery" ? (
        <div>
          <Label>Endereço de entrega</Label>
          <AddressEditor order={order} />

          {/* Frete calculado pelo sistema (a IA apenas consulta e informa). */}
          {!order.address ? (
            <p className="mt-2 rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-xs text-low">
              Aguardando endereço — o sistema calcula o frete pela zona do bairro.
            </p>
          ) : deliveryQuote ? (
            <div className="mt-2 rounded-lg border border-line bg-white/[0.02] p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-hi">
                  Zona {deliveryQuote.zone.name}
                </span>
                {deliveryQuote.freeApplied ? (
                  <span className="font-semibold text-accent">Frete grátis</span>
                ) : (
                  <span className="num font-semibold text-hi">
                    {formatCurrency(deliveryQuote.feeCents)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-low">
                Prazo {deliveryQuote.etaMinMinutes}–{deliveryQuote.etaMaxMinutes} min ·
                mínimo {formatCurrency(deliveryQuote.minOrderCents)}
              </p>
              <p className="mt-1 text-dim">
                Frete calculado pelo sistema · a IA apenas informa.
              </p>
            </div>
          ) : (
            <p className="mt-2 rounded-lg border border-warn/30 bg-warn/[0.07] px-3 py-2 text-xs text-warn">
              Região fora da área de entrega — transferir para um atendente.
            </p>
          )}
        </div>
      ) : null}

      <PaymentEditor order={order} />

      <div className="panel elev-low space-y-1 rounded-xl p-3 text-sm">
        <div className="flex justify-between text-low">
          <span>Subtotal</span>
          <span className="num text-mid">{formatCurrency(subtotalCents)}</span>
        </div>
        {order.fulfillment === "delivery" ? (
          <div className="flex justify-between text-low">
            <span>Taxa de entrega</span>
            <span className="num text-mid">
              {outOfArea
                ? "—"
                : deliveryQuote?.freeApplied
                  ? "Grátis"
                  : formatCurrency(order.deliveryFeeCents)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-subtle pt-1.5 text-base font-bold text-hi">
          <span>Total</span>
          <span className="num">{formatCurrency(totalCents)}</span>
        </div>
      </div>

      {isDraft ? (
        <div className="space-y-2">
          {issues.length > 0 ? (
            <ul className="space-y-1 rounded-lg border border-warn/30 bg-warn/[0.07] p-2.5 text-xs text-warn">
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
        <Button variant="primary" className="w-full" onClick={() => actions.advanceOrderStatus(order.id, nextStatus)}>
          <ArrowRight className="h-4 w-4" aria-hidden />
          Avançar para {ORDER_STATUS_LABELS[nextStatus].toLowerCase()}
        </Button>
      ) : null}

      {!isDraft && order.timeline.length > 1 ? (
        <div>
          <Label>Linha do tempo</Label>
          <ol className="relative space-y-2.5 border-l border-line pl-4">
            {order.timeline.map((entry, index) => (
              <li key={`${entry.status}-${entry.at}`} className="relative">
                <span
                  className={`absolute -left-[1.3rem] top-1 h-2 w-2 rounded-full ${
                    index === order.timeline.length - 1 ? "bg-accent" : "bg-strong"
                  }`}
                  aria-hidden
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-mid">{ORDER_STATUS_LABELS[entry.status]}</span>
                  <span className="num text-[11px] text-dim">{formatTime(entry.at)}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {canCancel ? (
        <Button variant="danger" className="w-full" onClick={() => setConfirmCancel(true)}>
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
