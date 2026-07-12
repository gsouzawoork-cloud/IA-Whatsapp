/**
 * Ferramenta determinística: verificação de disponibilidade de um produto.
 *
 * A disponibilidade vem de `product_availability`/`products.availability_mode` —
 * nunca da IA. Um item indisponível não pode ser confirmado. A quantidade não
 * pode ficar negativa. Alternativas são apenas SUGERIDAS, nunca trocadas
 * automaticamente.
 */

import { z } from "zod";
import type { AvailabilityMode } from "@/lib/supabase/database.types";

/** Snapshot mínimo do produto + sua disponibilidade na unidade. */
export interface AvailabilitySnapshot {
  readonly productId: string;
  readonly name: string;
  readonly category: string;
  readonly isActive: boolean;
  readonly availabilityMode: AvailabilityMode;
  /** Para modo "manual": disponível ou não. */
  readonly manualAvailable: boolean;
  /** Para modo "quantity": unidades restantes. */
  readonly quantity: number | null;
}

export const checkAvailabilityInput = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitId: z.string().uuid(),
});
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilityInput>;

export interface AvailabilityAlternative {
  readonly productId: string;
  readonly name: string;
}

export interface CheckAvailabilityResult {
  readonly available: boolean;
  readonly availableQuantity: number | null;
  readonly reason: string;
  readonly alternatives: readonly AvailabilityAlternative[];
}

/** Um produto está disponível para a quantidade pedida? */
function isAvailable(snapshot: AvailabilitySnapshot, quantity: number): boolean {
  if (!snapshot.isActive) {
    return false;
  }
  switch (snapshot.availabilityMode) {
    case "always_available":
      return true;
    case "manual":
      return snapshot.manualAvailable;
    case "quantity":
      return (snapshot.quantity ?? 0) >= quantity;
  }
}

/** Verificação pura de disponibilidade com alternativas da mesma categoria. */
export function checkAvailability(
  target: AvailabilitySnapshot,
  input: CheckAvailabilityInput,
  catalog: readonly AvailabilitySnapshot[] = [],
): CheckAvailabilityResult {
  const availableQuantity =
    target.availabilityMode === "quantity"
      ? Math.max(0, target.quantity ?? 0)
      : null;

  if (isAvailable(target, input.quantity)) {
    return {
      available: true,
      availableQuantity,
      reason: "Produto disponível.",
      alternatives: [],
    };
  }

  const alternatives = catalog
    .filter(
      (c) =>
        c.productId !== target.productId &&
        c.category === target.category &&
        isAvailable(c, 1),
    )
    .slice(0, 3)
    .map((c) => ({ productId: c.productId, name: c.name }));

  const reason =
    availableQuantity !== null
      ? `Quantidade indisponível: restam ${availableQuantity}.`
      : `"${target.name}" está indisponível no momento.`;

  return { available: false, availableQuantity, reason, alternatives };
}
