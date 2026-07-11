/**
 * Consultas puras de disponibilidade de produtos.
 *
 * A IA simulada consulta estas funções antes de oferecer ou adicionar um item;
 * ela nunca decide disponibilidade por conta própria.
 */

import { err, ok, type Result } from "@/lib/result";
import type { Product } from "../types";

/** Um produto está disponível para oferta/confirmação? */
export function isProductAvailable(product: Product): boolean {
  if (!product.active) {
    return false;
  }
  switch (product.availability.mode) {
    case "always_available":
      return true;
    case "manual":
      return product.availability.manualAvailable === true;
    case "quantity":
      return (product.availability.quantity ?? 0) > 0;
  }
}

/**
 * Quantidade disponível de um produto controlado por quantidade.
 * Retorna `null` quando o produto não é controlado por quantidade.
 */
export function getAvailableQuantity(product: Product): number | null {
  if (product.availability.mode !== "quantity") {
    return null;
  }
  return Math.max(0, product.availability.quantity ?? 0);
}

/**
 * O produto pode ser adicionado ao pedido na quantidade pedida?
 * `alreadyInOrder` considera unidades do mesmo produto já presentes no rascunho.
 */
export function canAddProductToOrder(
  product: Product,
  requestedQuantity: number,
  alreadyInOrder = 0,
): Result<Product> {
  if (requestedQuantity <= 0) {
    return err("Quantidade solicitada deve ser maior que zero.");
  }
  if (!isProductAvailable(product)) {
    return err(`"${product.name}" está indisponível no momento.`);
  }
  const available = getAvailableQuantity(product);
  if (available !== null && alreadyInOrder + requestedQuantity > available) {
    return err(
      `Quantidade indisponível para "${product.name}": restam ${available}.`,
    );
  }
  return ok(product);
}

/**
 * Alternativas disponíveis e aprovadas para um produto indisponível: mesma
 * categoria, ativas e disponíveis. Nunca troca automaticamente — apenas sugere.
 */
export function getProductAlternatives(
  product: Product,
  allProducts: readonly Product[],
  limit = 3,
): Product[] {
  return allProducts
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        candidate.categoryId === product.categoryId &&
        isProductAvailable(candidate),
    )
    .slice(0, limit);
}
