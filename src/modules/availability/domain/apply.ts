/**
 * Aplicação e restauração de disponibilidade na confirmação/cancelamento.
 *
 * Estas funções são puras e idempotentes: recebem o estado atual e um sinal de
 * "já aplicado" e devolvem um novo estado. A idempotência (não descontar nem
 * restaurar duas vezes) é garantida aqui, não apenas no chamador.
 */

import { err, ok, type Result } from "@/lib/result";
import type { Product } from "@/modules/catalog/types";
import type { OrderItem } from "@/modules/orders/types";

/** Resultado de uma aplicação/restauração de disponibilidade. */
export interface AvailabilityChange {
  /** Lista de produtos com quantidades ajustadas (cópia nova). */
  readonly products: Product[];
  /** Novo valor do sinal `availabilityApplied` do pedido. */
  readonly availabilityApplied: boolean;
}

/** Soma as quantidades pedidas por produto. */
function quantitiesByProduct(items: readonly OrderItem[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.productId, (totals.get(item.productId) ?? 0) + item.quantity);
  }
  return totals;
}

/** Ajusta a quantidade de um produto controlado por quantidade. */
function adjust(product: Product, delta: number): Product {
  if (product.availability.mode !== "quantity") {
    return product;
  }
  const current = product.availability.quantity ?? 0;
  const next = Math.max(0, current + delta);
  return {
    ...product,
    availability: { ...product.availability, quantity: next },
  };
}

/**
 * Desconta a disponibilidade dos itens ao confirmar o pedido.
 * Se já aplicado, retorna o estado inalterado (proteção contra desconto duplo).
 */
export function applyAvailabilityOnConfirmation(
  products: readonly Product[],
  items: readonly OrderItem[],
  alreadyApplied: boolean,
): Result<AvailabilityChange> {
  if (alreadyApplied) {
    return ok({ products: [...products], availabilityApplied: true });
  }
  const totals = quantitiesByProduct(items);
  const updated = products.map((product) => {
    const requested = totals.get(product.id);
    return requested ? adjust(product, -requested) : product;
  });
  return ok({ products: updated, availabilityApplied: true });
}

/**
 * Restaura a disponibilidade ao cancelar um pedido que já havia descontado.
 * Se nunca aplicado, retorna o estado inalterado (proteção contra restauração dupla).
 */
export function restoreAvailabilityOnCancellation(
  products: readonly Product[],
  items: readonly OrderItem[],
  wasApplied: boolean,
): Result<AvailabilityChange> {
  if (!wasApplied) {
    return ok({ products: [...products], availabilityApplied: false });
  }
  const totals = quantitiesByProduct(items);
  const updated = products.map((product) => {
    const requested = totals.get(product.id);
    return requested ? adjust(product, requested) : product;
  });
  return ok({ products: updated, availabilityApplied: false });
}

/** Define a quantidade absoluta de um produto controlado por quantidade. */
export function setProductQuantity(
  product: Product,
  quantity: number,
): Result<Product> {
  if (product.availability.mode !== "quantity") {
    return err("Produto não é controlado por quantidade.");
  }
  if (quantity < 0) {
    return err("Quantidade não pode ser negativa.");
  }
  return ok({
    ...product,
    availability: { ...product.availability, quantity },
  });
}
