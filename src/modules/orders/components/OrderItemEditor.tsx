"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import {
  getAvailableQuantity,
  isProductAvailable,
} from "@/modules/catalog/domain/availability";
import type { Order } from "../types";

/** Lista de itens do pedido com edição (apenas em rascunho) e catálogo para adicionar. */
export function OrderItemEditor({ order }: { order: Order }) {
  const { state, actions } = useDemo();
  const editable = order.status === "draft";

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {order.items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-xs text-low">
            Nenhum item ainda. Adicione produtos abaixo.
          </p>
        ) : (
          order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-lg border border-line bg-white/[0.02] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-hi">{item.productName}</p>
                <p className="num text-xs text-low">
                  {formatCurrency(item.unitPriceCents)} · un.
                </p>
              </div>
              {editable ? (
                <div className="flex items-center gap-0.5 rounded-lg border border-line bg-field p-0.5">
                  <button
                    type="button"
                    aria-label={`Diminuir ${item.productName}`}
                    onClick={() =>
                      actions.updateOrderItemQuantity(order.id, item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="rounded-md p-1 text-low hover:bg-white/[0.06] hover:text-hi disabled:opacity-30"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <span className="num w-6 text-center text-sm font-semibold text-hi">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Aumentar ${item.productName}`}
                    onClick={() =>
                      actions.updateOrderItemQuantity(order.id, item.id, item.quantity + 1)
                    }
                    className="rounded-md p-1 text-low hover:bg-white/[0.06] hover:text-hi"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover ${item.productName}`}
                    onClick={() => actions.removeOrderItem(order.id, item.id)}
                    className="ml-0.5 rounded-md p-1 text-bad hover:bg-bad/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ) : (
                <span className="num text-sm font-semibold text-mid">{item.quantity}×</span>
              )}
            </div>
          ))
        )}
      </div>

      {editable ? (
        <details className="group rounded-lg border border-line bg-white/[0.02]">
          <summary className="flex cursor-pointer select-none items-center justify-between px-3 py-2 text-sm font-semibold text-accent">
            Adicionar item do cardápio
            <Plus className="h-4 w-4 transition-transform group-open:rotate-45" aria-hidden />
          </summary>
          <div className="scroll-slim max-h-64 space-y-3 overflow-y-auto border-t border-subtle p-3">
            {state.data.categories.map((category) => {
              const products = state.data.products.filter(
                (p) => p.categoryId === category.id,
              );
              if (products.length === 0) {
                return null;
              }
              return (
                <div key={category.id}>
                  <p className="t-eyebrow mb-1 text-[10px] uppercase">{category.name}</p>
                  <div className="space-y-0.5">
                    {products.map((product) => {
                      const available = isProductAvailable(product);
                      const quantity = getAvailableQuantity(product);
                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.03]"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-mid">{product.name}</p>
                            <p className="num text-xs text-low">
                              {formatCurrency(product.priceCents)}
                              {quantity !== null ? ` · ${quantity} disp.` : ""}
                              {!available ? " · indisponível" : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => actions.addOrderItem(order.id, product.id, 1)}
                            disabled={!available}
                            className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-hi transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            Adicionar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      ) : null}
    </div>
  );
}
