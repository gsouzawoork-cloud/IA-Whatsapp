"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import type { Product } from "../types";

/** Controle de disponibilidade conforme o modo do produto. */
export function ProductAvailabilityControl({ product }: { product: Product }) {
  const { state, actions } = useDemo();
  const [confirmDisable, setConfirmDisable] = useState(false);

  if (product.availability.mode === "always_available") {
    return <Badge tone="success">Sempre disponível</Badge>;
  }

  if (product.availability.mode === "manual") {
    const available = product.availability.manualAvailable === true;
    const inDraft = state.data.orders.some(
      (order) =>
        order.status === "draft" &&
        order.items.some((item) => item.productId === product.id),
    );

    function toggle() {
      if (available && inDraft) {
        setConfirmDisable(true);
        return;
      }
      actions.setProductManualAvailability(product.id, !available);
    }

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={available}
          aria-label={`Disponibilidade de ${product.name}`}
          onClick={toggle}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            available ? "bg-emerald-500" : "bg-neutral-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              available ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className="text-xs text-neutral-400">
          {available ? "Disponível" : "Indisponível"}
        </span>

        <ConfirmDialog
          open={confirmDisable}
          title="Marcar como indisponível?"
          description={`"${product.name}" está em um rascunho de pedido. Torná-lo indisponível pode bloquear a confirmação desse pedido.`}
          confirmLabel="Marcar indisponível"
          onCancel={() => setConfirmDisable(false)}
          onConfirm={() => {
            actions.setProductManualAvailability(product.id, false);
            setConfirmDisable(false);
          }}
        />
      </div>
    );
  }

  const quantity = product.availability.quantity ?? 0;
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Diminuir quantidade de ${product.name}`}
        onClick={() => actions.setProductQuantity(product.id, quantity - 1)}
        disabled={quantity <= 0}
        className="rounded p-1 text-neutral-400 hover:bg-neutral-800 disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span
        className={`w-8 text-center text-sm tabular-nums ${
          quantity === 0 ? "text-red-400" : "text-neutral-100"
        }`}
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`Aumentar quantidade de ${product.name}`}
        onClick={() => actions.setProductQuantity(product.id, quantity + 1)}
        className="rounded p-1 text-neutral-400 hover:bg-neutral-800"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
