/**
 * Tipos do domínio de pedidos.
 *
 * O status operacional é um conjunto fechado; as transições permitidas vivem em
 * `../domain`. Valores em centavos e sempre calculados pela aplicação.
 */

import type { PaymentDetails } from "@/modules/payments/types";

/** Estados operacionais de um pedido (conjunto fechado). */
export type OrderStatus =
  | "draft"
  | "awaiting_information"
  | "awaiting_confirmation"
  | "awaiting_payment"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

/** Forma de entrega do pedido. */
export type FulfillmentType = "delivery" | "pickup";

/** Item de um pedido, com o preço congelado no momento da inclusão. */
export interface OrderItem {
  readonly id: string;
  readonly productId: string;
  /** Nome copiado para leitura estável no histórico. */
  readonly productName: string;
  quantity: number;
  /** Preço unitário em centavos no momento da inclusão. */
  readonly unitPriceCents: number;
  notes?: string;
}

/** Endereço de entrega registrado no pedido. */
export interface OrderAddress {
  readonly street: string;
  readonly number: string;
  readonly complement?: string;
  readonly district: string;
  readonly city: string;
  readonly reference?: string;
}

/** Entrada de linha do tempo do pedido. */
export interface OrderTimelineEntry {
  readonly status: OrderStatus;
  readonly at: string;
  /** Ator da transição (operador ou sistema). */
  readonly actor: string;
}

/** Pedido simulado, ligado a um cliente e, quando houver, a uma conversa. */
export interface Order {
  readonly id: string;
  /** Número legível do pedido (ex.: "#1042"). */
  readonly number: string;
  readonly customerId: string;
  readonly conversationId?: string;
  status: OrderStatus;
  fulfillment: FulfillmentType;
  items: OrderItem[];
  address?: OrderAddress;
  payment: PaymentDetails;
  /** Taxa de entrega em centavos (0 para retirada). */
  deliveryFeeCents: number;
  /**
   * Registra se a confirmação deste pedido já descontou a disponibilidade,
   * evitando desconto/restauração em duplicidade.
   */
  availabilityApplied: boolean;
  readonly createdAt: string;
  timeline: OrderTimelineEntry[];
  notes?: string;
}
