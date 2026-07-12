/**
 * Ferramenta determinística: rascunho de pedido (order.createDraft) e consulta
 * de status (order.getStatus).
 *
 * Aqui ficam os schemas e as regras PURAS (campos faltantes, transições de
 * status permitidas). A persistência (gravar no banco, gerar order_number,
 * aplicar idempotency_key) acontece na camada de repositório/execução — que
 * consome estas regras. Um pedido sempre começa em "draft" e nenhum pagamento é
 * confirmado automaticamente.
 */

import { z } from "zod";
import type { FulfillmentType, OrderStatus } from "@/lib/supabase/database.types";

export const draftItem = z.object({
  productId: z.string().uuid().nullable(),
  productNameSnapshot: z.string().trim().min(1),
  unitPriceSnapshotCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

export const createDraftInput = z.object({
  customerId: z.string().uuid().nullable(),
  unitId: z.string().uuid(),
  items: z.array(draftItem).min(1),
  fulfillment: z.custom<FulfillmentType>(
    (v) => v === "delivery" || v === "pickup",
  ),
  deliveryAddress: z.string().trim().min(1).nullable(),
  deliveryZoneId: z.string().uuid().nullable(),
  idempotencyKey: z.string().trim().min(1).optional(),
});
export type CreateDraftInput = z.infer<typeof createDraftInput>;

/**
 * Campos ainda faltantes para o pedido avançar de "draft". Determinístico: uma
 * entrega exige endereço e zona; retirada não.
 */
export function missingDraftFields(input: CreateDraftInput): readonly string[] {
  const missing: string[] = [];
  if (input.items.length === 0) {
    missing.push("items");
  }
  if (input.fulfillment === "delivery") {
    if (!input.deliveryAddress) {
      missing.push("deliveryAddress");
    }
    if (!input.deliveryZoneId) {
      missing.push("deliveryZoneId");
    }
  }
  return missing;
}

/** Transições de status permitidas (mesma máquina do domínio de pedidos). */
const ALLOWED_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  draft: ["pending", "cancelled"],
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["dispatched", "delivered", "cancelled"],
  dispatched: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

/** `true` se a transição de status é permitida. */
export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export const getStatusInput = z
  .object({
    orderId: z.string().uuid().optional(),
    orderNumber: z.string().trim().min(1).optional(),
  })
  .refine((v) => v.orderId !== undefined || v.orderNumber !== undefined, {
    message: "Informe orderId ou orderNumber.",
  });
export type GetStatusInput = z.infer<typeof getStatusInput>;
