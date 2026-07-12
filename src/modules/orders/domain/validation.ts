/**
 * Validação de um pedido para confirmação.
 *
 * Regras determinísticas: sem itens, sem endereço (entrega) ou sem forma de
 * pagamento bloqueiam a confirmação; item indisponível também bloqueia.
 */

import { err, ok, type Result } from "@/lib/result";
import type { Product } from "@/modules/catalog/types";
import { isProductAvailable } from "@/modules/catalog/domain/availability";
import type { Order } from "../types";

/**
 * Lista de impedimentos para confirmar um pedido. Vazia significa "pode confirmar".
 * Usada tanto pela validação quanto pela interface (feedback inline).
 */
export function getOrderConfirmationIssues(
  order: Order,
  products: readonly Product[],
): string[] {
  const issues: string[] = [];

  if (order.items.length === 0) {
    issues.push("Adicione ao menos um item ao pedido.");
  }

  if (order.fulfillment === "delivery" && !order.address) {
    issues.push("Informe o endereço de entrega.");
  }

  // A forma de pagamento é obrigatória; `not_started` representa "ainda não definida".
  if (order.payment.status === "not_started") {
    issues.push("Selecione uma forma de pagamento.");
  }

  const requestedByProduct = new Map<string, number>();
  for (const item of order.items) {
    requestedByProduct.set(
      item.productId,
      (requestedByProduct.get(item.productId) ?? 0) + item.quantity,
    );
  }

  for (const [productId, requested] of requestedByProduct) {
    const product = products.find((candidate) => candidate.id === productId);
    if (!product) {
      issues.push("Um item do pedido não existe mais no cardápio.");
      continue;
    }
    if (!isProductAvailable(product)) {
      issues.push(`"${product.name}" está indisponível.`);
      continue;
    }
    if (product.availability.mode === "quantity") {
      const available = product.availability.quantity ?? 0;
      if (requested > available) {
        issues.push(
          `"${product.name}": quantidade indisponível (restam ${available}).`,
        );
      }
    }
  }

  return issues;
}

/** Valida um pedido para confirmação, devolvendo erro explícito quando inválido. */
export function validateOrderForConfirmation(
  order: Order,
  products: readonly Product[],
): Result<Order> {
  const issues = getOrderConfirmationIssues(order, products);
  if (issues.length > 0) {
    return err(issues.join(" "));
  }
  return ok(order);
}
