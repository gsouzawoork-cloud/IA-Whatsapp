"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { calculateOrderTotal } from "@/modules/orders/domain/pricing";
import { PAYMENT_METHOD_LABELS } from "../labels";
import type { Order } from "../types";
import type { PaymentMethod } from "@/modules/payments/types";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

const METHODS: readonly PaymentMethod[] = [
  "pix_simulated",
  "card_on_delivery",
  "cash_on_delivery",
];

/** Converte um valor em reais digitado (ex.: "50,00") para centavos. */
function reaisToCents(value: string): number | null {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.round(parsed * 100);
}

/** Seleção e detalhes da forma de pagamento simulada. */
export function PaymentEditor({ order }: { order: Order }) {
  const { actions } = useDemo();
  const [cashInput, setCashInput] = useState("");
  const total = calculateOrderTotal(order.items, order.deliveryFeeCents);

  const editable =
    order.status === "draft" ||
    order.status === "awaiting_information" ||
    order.status === "awaiting_confirmation" ||
    order.status === "awaiting_payment";

  const method = order.payment.status === "not_started" ? null : order.payment.method;

  function submitCash() {
    const cents = reaisToCents(cashInput);
    if (cents === null) {
      return;
    }
    actions.setOrderPayment(order.id, {
      method: "cash_on_delivery",
      status: "pay_on_delivery",
      cashGivenCents: cents,
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-300">Pagamento</span>
        <PaymentStatusBadge status={order.payment.status} />
      </div>

      {editable ? (
        <div className="flex flex-wrap gap-1.5">
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                if (m === "pix_simulated") {
                  actions.setOrderPayment(order.id, {
                    method: "pix_simulated",
                    status: "awaiting",
                  });
                } else if (m === "card_on_delivery") {
                  actions.setOrderPayment(order.id, {
                    method: "card_on_delivery",
                    status: "pay_on_delivery",
                    cardKind: "credit",
                  });
                }
                // Dinheiro depende do valor entregue: tratado no campo abaixo.
              }}
              aria-pressed={method === m}
              className={`rounded-md border px-2.5 py-1.5 text-xs ${
                method === m
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                  : "border-neutral-800 text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              {PAYMENT_METHOD_LABELS[m]}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-200">
          {method ? PAYMENT_METHOD_LABELS[method] : "Não definido"}
        </p>
      )}

      {/* Cartão na entrega: escolher crédito ou débito. */}
      {editable && method === "card_on_delivery" ? (
        <div className="flex gap-1.5">
          {(["credit", "debit"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() =>
                actions.setOrderPayment(order.id, {
                  method: "card_on_delivery",
                  status: "pay_on_delivery",
                  cardKind: kind,
                })
              }
              aria-pressed={order.payment.cardKind === kind}
              className={`rounded-md border px-2.5 py-1 text-xs ${
                order.payment.cardKind === kind
                  ? "border-sky-500/50 bg-sky-500/10 text-sky-300"
                  : "border-neutral-800 text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              {kind === "credit" ? "Crédito" : "Débito"} · maquininha
            </button>
          ))}
        </div>
      ) : null}

      {/* Dinheiro: valor entregue e troco calculado pela aplicação. */}
      {editable ? (
        <div className="flex items-end gap-2">
          <label className="flex-1">
            <span className="text-xs text-neutral-500">Dinheiro — valor entregue (R$)</span>
            <input
              inputMode="decimal"
              value={cashInput}
              onChange={(event) => setCashInput(event.target.value)}
              placeholder={formatCurrency(total).replace("R$", "").trim()}
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500/50 focus:outline-none"
            />
          </label>
          <Button size="sm" variant="secondary" onClick={submitCash} disabled={!cashInput.trim()}>
            Definir
          </Button>
        </div>
      ) : null}

      {order.payment.method === "cash_on_delivery" &&
      order.payment.changeCents !== undefined ? (
        <p className="text-xs text-neutral-400">
          Troco: {formatCurrency(order.payment.changeCents)}
        </p>
      ) : null}

      {order.payment.method === "pix_simulated" &&
      order.payment.status === "awaiting" ? (
        <Button
          size="sm"
          variant="primary"
          onClick={() => actions.simulatePixPaid(order.id)}
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          Simular pagamento confirmado
        </Button>
      ) : null}
    </div>
  );
}
