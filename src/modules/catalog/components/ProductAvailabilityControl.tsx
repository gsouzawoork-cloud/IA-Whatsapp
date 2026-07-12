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
    return <Badge tone="success" dot>Sempre disponível</Badge>;
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
      <div className="flex items-center gap-2.5">
        <span className={`text-xs font-semibold ${available ? "text-ok" : "text-low"}`}>
          {available ? "Disponível" : "Indisponível"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={available}
          aria-label={`Disponibilidade de ${product.name}`}
          onClick={toggle}
          className={`relative inline-flex h-5 w-9 items-center rounded-full border transition-colors ${
            available
              ? "border-accent/40 bg-accent/80 shadow-[0_0_10px_rgba(114,214,173,0.4)]"
              : "border-line bg-white/[0.06]"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              available ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>

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
    <div className="flex items-center gap-0.5 rounded-lg border border-line bg-field p-0.5">
      <button
        type="button"
        aria-label={`Diminuir quantidade de ${product.name}`}
        onClick={() => actions.setProductQuantity(product.id, quantity - 1)}
        disabled={quantity <= 0}
        className="rounded-md p-1 text-low hover:bg-white/[0.06] hover:text-hi disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span
        className={`num w-9 text-center text-sm font-bold ${
          quantity === 0 ? "text-bad" : "text-hi"
        }`}
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`Aumentar quantidade de ${product.name}`}
        onClick={() => actions.setProductQuantity(product.id, quantity + 1)}
        className="rounded-md p-1 text-low hover:bg-white/[0.06] hover:text-hi"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
