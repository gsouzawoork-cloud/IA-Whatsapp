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
    <div className="space-y-4">
      <div className="space-y-1.5">
        {order.items.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-800 px-3 py-4 text-center text-xs text-neutral-500">
            Nenhum item ainda. Adicione produtos abaixo.
          </p>
        ) : (
          order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-neutral-100">{item.productName}</p>
                <p className="text-xs text-neutral-500">
                  {formatCurrency(item.unitPriceCents)} · un.
                </p>
              </div>
              {editable ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Diminuir ${item.productName}`}
                    onClick={() =>
                      actions.updateOrderItemQuantity(order.id, item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-800 disabled:opacity-30"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <span className="w-6 text-center text-sm tabular-nums text-neutral-100">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Aumentar ${item.productName}`}
                    onClick={() =>
                      actions.updateOrderItemQuantity(order.id, item.id, item.quantity + 1)
                    }
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-800"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover ${item.productName}`}
                    onClick={() => actions.removeOrderItem(order.id, item.id)}
                    className="ml-1 rounded p-1 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ) : (
                <span className="text-sm tabular-nums text-neutral-300">
                  {item.quantity}×
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {editable ? (
        <details className="rounded-md border border-neutral-800">
          <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-emerald-300">
            Adicionar item do cardápio
          </summary>
          <div className="max-h-64 space-y-3 overflow-y-auto p-3">
            {state.data.categories.map((category) => {
              const products = state.data.products.filter(
                (p) => p.categoryId === category.id,
              );
              if (products.length === 0) {
                return null;
              }
              return (
                <div key={category.id}>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    {category.name}
                  </p>
                  <div className="space-y-1">
                    {products.map((product) => {
                      const available = isProductAvailable(product);
                      const quantity = getAvailableQuantity(product);
                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-neutral-900"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-neutral-200">
                              {product.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {formatCurrency(product.priceCents)}
                              {quantity !== null ? ` · ${quantity} disp.` : ""}
                              {!available ? " · indisponível" : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => actions.addOrderItem(order.id, product.id, 1)}
                            disabled={!available}
                            className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
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
