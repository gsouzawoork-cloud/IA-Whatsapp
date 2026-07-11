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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="t-eyebrow text-[10px] uppercase">Pagamento</span>
        <PaymentStatusBadge status={order.payment.status} />
      </div>

      {editable ? (
        <div className="grid grid-cols-3 gap-1.5">
          {METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                if (m === "pix_simulated") {
                  actions.setOrderPayment(order.id, { method: "pix_simulated", status: "awaiting" });
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
              className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold transition-colors ${
                method === m
                  ? "border-accent/40 bg-accent-soft text-accent"
                  : "border-line text-mid hover:bg-white/[0.05]"
              }`}
            >
              {PAYMENT_METHOD_LABELS[m]}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-hi">{method ? PAYMENT_METHOD_LABELS[method] : "Não definido"}</p>
      )}

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
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                order.payment.cardKind === kind
                  ? "border-info/40 bg-info/10 text-info"
                  : "border-line text-mid hover:bg-white/[0.05]"
              }`}
            >
              {kind === "credit" ? "Crédito" : "Débito"} · maquininha
            </button>
          ))}
        </div>
      ) : null}

      {editable ? (
        <div className="flex items-end gap-2">
          <label className="flex-1">
            <span className="text-[11px] text-low">Dinheiro — valor entregue (R$)</span>
            <input
              inputMode="decimal"
              value={cashInput}
              onChange={(event) => setCashInput(event.target.value)}
              placeholder={formatCurrency(total).replace("R$", "").trim()}
              className="field num mt-1 w-full rounded-lg px-2.5 py-1.5 text-sm text-hi placeholder:text-dim"
            />
          </label>
          <Button size="sm" variant="secondary" onClick={submitCash} disabled={!cashInput.trim()}>
            Definir
          </Button>
        </div>
      ) : null}

      {order.payment.method === "cash_on_delivery" && order.payment.changeCents !== undefined ? (
        <p className="num text-xs text-mid">Troco: {formatCurrency(order.payment.changeCents)}</p>
      ) : null}

      {order.payment.method === "pix_simulated" && order.payment.status === "awaiting" ? (
        <Button size="sm" variant="primary" className="w-full" onClick={() => actions.simulatePixPaid(order.id)}>
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          Simular pagamento confirmado
        </Button>
      ) : null}
    </div>
  );
}
