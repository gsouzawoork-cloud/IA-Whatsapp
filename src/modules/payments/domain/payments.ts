/**
 * Regras puras de pagamento simulado.
 *
 * Nenhum pagamento real é processado. As funções apenas validam os detalhes e
 * calculam o troco de forma determinística.
 */

import { err, ok, type Result } from "@/lib/result";
import type { PaymentDetails } from "../types";

/**
 * Calcula o troco em centavos. Falha quando o valor entregue é menor que o
 * total — nunca é permitido pagar em dinheiro abaixo do total.
 */
export function calculateChange(
  totalCents: number,
  cashGivenCents: number,
): Result<number> {
  if (cashGivenCents < totalCents) {
    return err("Valor entregue é menor que o total do pedido.");
  }
  return ok(cashGivenCents - totalCents);
}

/** Valida os detalhes de pagamento conforme o método escolhido. */
export function validatePaymentDetails(
  details: PaymentDetails,
  totalCents: number,
): Result<PaymentDetails> {
  switch (details.method) {
    case "pix_simulated":
      return ok(details);
    case "card_on_delivery":
      if (!details.cardKind) {
        return err("Informe se o cartão é de crédito ou débito.");
      }
      return ok(details);
    case "cash_on_delivery": {
      if (details.cashGivenCents === undefined) {
        return err("Informe o valor que o cliente vai entregar.");
      }
      const change = calculateChange(totalCents, details.cashGivenCents);
      if (!change.ok) {
        return change;
      }
      return ok({ ...details, changeCents: change.value });
    }
  }
}
