/**
 * Ferramenta determinística: cálculo de totais do pedido.
 *
 * Regras inegociáveis (Fase 3):
 *   * subtotal = soma de (preço unitário × quantidade);
 *   * total = subtotal + frete − desconto;
 *   * desconto permanece ZERO — não há política de desconto autorizada nesta
 *     fase; qualquer desconto > 0 vira erro de validação;
 *   * o total NUNCA é aceito do navegador — é sempre recomputado aqui.
 */

import { z } from "zod";

export const totalsItem = z.object({
  unitPriceCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

export const calculateTotalsInput = z.object({
  items: z.array(totalsItem).min(1),
  deliveryFeeCents: z.number().int().nonnegative(),
  // Nesta fase não há desconto autorizado; default 0 e proibido ser > 0.
  discountTotalCents: z.number().int().nonnegative().default(0),
});
export type CalculateTotalsInput = z.infer<typeof calculateTotalsInput>;

export interface CalculateTotalsResult {
  readonly subtotalCents: number;
  readonly deliveryFeeCents: number;
  readonly discountTotalCents: number;
  readonly totalCents: number;
  readonly validationErrors: readonly string[];
}

/** Cálculo puro e determinístico dos totais. */
export function calculateTotals(
  input: CalculateTotalsInput,
): CalculateTotalsResult {
  const errors: string[] = [];

  const subtotalCents = input.items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );

  // Desconto não autorizado nesta fase.
  const discountTotalCents = input.discountTotalCents;
  if (discountTotalCents > 0) {
    errors.push("Desconto não autorizado nesta fase.");
  }

  const effectiveDiscount = discountTotalCents > 0 ? 0 : discountTotalCents;
  const totalCents = subtotalCents + input.deliveryFeeCents - effectiveDiscount;

  if (totalCents < 0) {
    errors.push("Total não pode ser negativo.");
  }

  return {
    subtotalCents,
    deliveryFeeCents: input.deliveryFeeCents,
    discountTotalCents: effectiveDiscount,
    totalCents: Math.max(0, totalCents),
    validationErrors: errors,
  };
}
