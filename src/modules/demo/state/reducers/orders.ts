/**
 * Sub-reducer das ações de pedido, pagamento e disponibilidade na confirmação.
 *
 * Todos os cálculos e transições passam pelas regras puras. A disponibilidade é
 * descontada na confirmação e restaurada no cancelamento, sempre uma única vez,
 * graças ao sinal `availabilityApplied` do pedido.
 */

import type { DemoData } from "@/data/demo";
import type { Order, OrderItem } from "@/modules/orders/types";
import type { PaymentDetails, PaymentStatus } from "@/modules/payments/types";
import {
  calculateDeliveryFee,
  calculateOrderTotal,
} from "@/modules/orders/domain/pricing";
import {
  canTransitionOrder,
  transitionOrderStatus,
} from "@/modules/orders/domain/transitions";
import { validateOrderForConfirmation } from "@/modules/orders/domain/validation";
import { validatePaymentDetails } from "@/modules/payments/domain/payments";
import { canAddProductToOrder } from "@/modules/catalog/domain/availability";
import {
  applyAvailabilityOnConfirmation,
  restoreAvailabilityOnCancellation,
} from "@/modules/availability/domain/apply";
import { ORDER_STATUS_LABELS } from "@/modules/orders/labels";
import type { ActionMeta, DemoAction, DemoState } from "../types";
import { getConversation, getOrder, getProduct } from "../selectors";
import {
  appendMessage,
  commit,
  fail,
  patchConversation,
  patchOrder,
  systemMessage,
} from "./helpers";

type OrderActionType =
  | "CREATE_DRAFT_ORDER"
  | "ADD_ORDER_ITEM"
  | "REMOVE_ORDER_ITEM"
  | "UPDATE_ORDER_ITEM_QUANTITY"
  | "SET_ORDER_FULFILLMENT"
  | "SET_ORDER_ADDRESS"
  | "SET_ORDER_PAYMENT"
  | "CONFIRM_ORDER"
  | "ADVANCE_ORDER_STATUS"
  | "CANCEL_ORDER"
  | "SIMULATE_PIX_PAID";

type OrderAction = Extract<DemoAction, { type: OrderActionType }>;

/** Só é possível editar itens de um rascunho. */
function isDraft(order: Order): boolean {
  return order.status === "draft";
}

/** Estados em que a forma de pagamento ainda pode ser definida. */
function isPaymentEditable(order: Order): boolean {
  return (
    order.status === "draft" ||
    order.status === "awaiting_information" ||
    order.status === "awaiting_confirmation" ||
    order.status === "awaiting_payment"
  );
}

function nextOrderNumber(orders: readonly Order[]): string {
  const max = orders.reduce((current, order) => {
    const value = Number.parseInt(order.number.replace(/\D/g, ""), 10);
    return Number.isFinite(value) && value > current ? value : current;
  }, 1000);
  return `#${max + 1}`;
}

function quantityOfProduct(order: Order, productId: string): number {
  return order.items
    .filter((item) => item.productId === productId)
    .reduce((total, item) => total + item.quantity, 0);
}

/** Anexa uma mensagem de sistema à conversa relacionada, se existir. */
function orderSystemMessage(
  data: DemoData,
  order: Order,
  content: string,
  meta: ActionMeta,
): DemoData {
  if (!order.conversationId) {
    return data;
  }
  const withMessage = appendMessage(
    data,
    systemMessage(order.conversationId, content, meta, "-sys"),
  );
  return patchConversation(withMessage, order.conversationId, {
    lastMessageAt: meta.now,
  });
}

export function ordersReducer(state: DemoState, action: OrderAction): DemoState {
  switch (action.type) {
    case "CREATE_DRAFT_ORDER": {
      const conversation = getConversation(state.data, action.conversationId);
      if (!conversation) {
        return fail(state, "Conversa não encontrada.");
      }
      if (conversation.orderId) {
        return fail(state, "Esta conversa já possui um pedido.");
      }
      const customer = state.data.customers.find(
        (c) => c.id === conversation.customerId,
      );
      const primaryAddress = customer?.addresses[0];
      const order: Order = {
        id: action.meta.id,
        number: nextOrderNumber(state.data.orders),
        customerId: conversation.customerId,
        conversationId: conversation.id,
        status: "draft",
        fulfillment: "delivery",
        items: [],
        address: primaryAddress
          ? {
              street: primaryAddress.street,
              number: primaryAddress.number,
              complement: primaryAddress.complement,
              district: primaryAddress.district,
              city: primaryAddress.city,
              reference: primaryAddress.reference,
            }
          : undefined,
        payment: { method: "pix_simulated", status: "not_started" },
        deliveryFeeCents: state.data.business.defaultDeliveryFeeCents,
        availabilityApplied: false,
        createdAt: action.meta.now,
        timeline: [{ status: "draft", at: action.meta.now, actor: "Você" }],
      };
      let data: DemoData = { ...state.data, orders: [...state.data.orders, order] };
      data = patchConversation(data, conversation.id, { orderId: order.id });
      data = orderSystemMessage(
        data,
        order,
        `Rascunho de pedido ${order.number} criado.`,
        action.meta,
      );
      return commit(state, { data }, { kind: "success", message: "Rascunho criado." });
    }

    case "ADD_ORDER_ITEM": {
      const order = getOrder(state.data, action.orderId);
      if (!order) {
        return fail(state, "Pedido não encontrado.");
      }
      if (!isDraft(order)) {
        return fail(state, "Só é possível editar itens de um rascunho.");
      }
      const product = getProduct(state.data, action.productId);
      if (!product) {
        return fail(state, "Produto não encontrado.");
      }
      const already = quantityOfProduct(order, product.id);
      const check = canAddProductToOrder(product, action.quantity, already);
      if (!check.ok) {
        return fail(state, check.error);
      }
      const existing = order.items.find((item) => item.productId === product.id);
      let items: OrderItem[];
      if (existing) {
        items = order.items.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + action.quantity }
            : item,
        );
      } else {
        items = [
          ...order.items,
          {
            id: action.meta.id,
            productId: product.id,
            productName: product.name,
            quantity: action.quantity,
            unitPriceCents: product.priceCents,
          },
        ];
      }
      const data = patchOrder(state.data, order.id, { items });
      return commit(state, { data }, { kind: "success", message: "Item adicionado." });
    }

    case "REMOVE_ORDER_ITEM": {
      const order = getOrder(state.data, action.orderId);
      if (!order) {
        return fail(state, "Pedido não encontrado.");
      }
      if (!isDraft(order)) {
        return fail(state, "Só é possível editar itens de um rascunho.");
      }
      const items = order.items.filter((item) => item.id !== action.itemId);
      const data = patchOrder(state.data, order.id, { items });
      return commit(state, { data }, { kind: "info", message: "Item removido." });
    }

    case "UPDATE_ORDER_ITEM_QUANTITY": {
      const order = getOrder(state.data, action.orderId);
      if (!order) {
        return fail(state, "Pedido não encontrado.");
      }
      if (!isDraft(order)) {
        return fail(state, "Só é possível editar itens de um rascunho.");
      }
      if (action.quantity < 1) {
        return fail(state, "A quantidade mínima é 1.");
      }
      const item = order.items.find((i) => i.id === action.itemId);
      if (!item) {
        return fail(state, "Item não encontrado.");
      }
      const product = getProduct(state.data, item.productId);
      if (product) {
        const otherQuantity = quantityOfProduct(order, product.id) - item.quantity;
        const check = canAddProductToOrder(product, action.quantity, otherQuantity);
        if (!check.ok) {
          return fail(state, check.error);
        }
      }
      const items = order.items.map((i) =>
        i.id === item.id ? { ...i, quantity: action.quantity } : i,
      );
      const data = patchOrder(state.data, order.id, { items });
      return commit(state, { data }, { kind: "success", message: "Quantidade atualizada." });
    }

    case "SET_ORDER_FULFILLMENT": {
      const order = getOrder(state.data, action.orderId);
      if (!order) {
        return fail(state, "Pedido não encontrado.");
      }
      if (!isDraft(order)) {
        return fail(state, "Só é possível alterar a entrega de um rascunho.");
      }
      const deliveryFeeCents = calculateDeliveryFee(
        action.fulfillment,
        state.data.business.defaultDeliveryFeeCents,
      );
      const data = patchOrder(state.data, order.id, {
        fulfillment: action.fulfillment,
        deliveryFeeCents,
        address: action.fulfillment === "pickup" ? undefined : order.address,
      });
      return commit(state, { data }, { kind: "info", message: "Tipo de entrega atualizado." });
    }

    case "SET_ORDER_ADDRESS": {
      const order = getOrder(state.data, action.orderId);
      if (!order) {
        return fail(state, "Pedido não encontrado.");
      }
      if (!isDraft(order)) {
        return fail(state, "Só é possível alterar o endereço de um rascunho.");
      }
      const data = patchOrder(state.data, order.id, { address: action.address });
      return commit(state, { data }, { kind: "success", message: "Endereço registrado." });
    }

    case "SET_ORDER_PAYMENT": {
      const order = getOrder(state.data, action.orderId);
      if (!order) {
        return fail(state, "Pedido não encontrado.");
      }
      if (!isPaymentEditable(order)) {
        return fail(state, "A forma de pagamento não pode mais ser alterada.");
      }
      const total = calculateOrderTotal(order.items, order.deliveryFeeCents);
      const validated = validatePaymentDetails(action.payment, total);
      if (!validated.ok) {
        return fail(state, validated.error);
      }
      const status: PaymentStatus =
        validated.value.method === "pix_simulated" ? "awaiting" : "pay_on_delivery";
      const payment: PaymentDetails = { ...validated.value, status };
      const data = patchOrder(state.data, order.id, { payment });
      return commit(state, { data }, { kind: "success", message: "Forma de pagamento definida." });
    }

    case "CONFIRM_ORDER": {
      const order = getOrder(state.data, action.orderId);
      if (!order) {
        return fail(state, "Pedido não encontrado.");
      }
      const validation = validateOrderForConfirmation(order, state.data.products);
      if (!validation.ok) {
        return fail(state, validation.error);
      }
      if (!canTransitionOrder(order.status, "confirmed")) {
        return fail(state, "Este pedido não pode ser confirmado agora.");
      }
      const applied = applyAvailabilityOnConfirmation(
        state.data.products,
        order.items,
        order.availabilityApplied,
      );
      if (!applied.ok) {
        return fail(state, applied.error);
      }
      let data: DemoData = { ...state.data, products: applied.value.products };
      data = patchOrder(data, order.id, {
        status: "confirmed",
        availabilityApplied: applied.value.availabilityApplied,
        timeline: [
          ...order.timeline,
          { status: "confirmed", at: action.meta.now, actor: "Você" },
        ],
      });
      data = orderSystemMessage(
        data,
        order,
        `Pedido ${order.number}: confirmado. Entrou na fila de preparo.`,
        action.meta,
      );
      return commit(state, { data }, { kind: "success", message: "Pedido confirmado." });
    }

    case "ADVANCE_ORDER_STATUS": {
      const order = getOrder(state.data, action.orderId);
      if (!order) {
        return fail(state, "Pedido não encontrado.");
      }
      const transition = transitionOrderStatus(order.status, action.to);
      if (!transition.ok) {
        return fail(state, transition.error);
      }
      let data = patchOrder(state.data, order.id, {
        status: transition.value,
        timeline: [
          ...order.timeline,
          { status: transition.value, at: action.meta.now, actor: "Você" },
        ],
      });
      data = orderSystemMessage(
        data,
        order,
        `Pedido ${order.number}: ${ORDER_STATUS_LABELS[transition.value].toLowerCase()}.`,
        action.meta,
      );
      return commit(state, { data }, { kind: "success", message: "Status atualizado." });
    }

    case "CANCEL_ORDER": {
      const order = getOrder(state.data, action.orderId);
      if (!order) {
        return fail(state, "Pedido não encontrado.");
      }
      if (!canTransitionOrder(order.status, "cancelled")) {
        return fail(state, "Este pedido não pode ser cancelado.");
      }
      const restored = restoreAvailabilityOnCancellation(
        state.data.products,
        order.items,
        order.availabilityApplied,
      );
      if (!restored.ok) {
        return fail(state, restored.error);
      }
      let data: DemoData = { ...state.data, products: restored.value.products };
      data = patchOrder(data, order.id, {
        status: "cancelled",
        availabilityApplied: restored.value.availabilityApplied,
        payment: { ...order.payment, status: "cancelled" },
        timeline: [
          ...order.timeline,
          { status: "cancelled", at: action.meta.now, actor: "Você" },
        ],
      });
      data = orderSystemMessage(
        data,
        order,
        `Pedido ${order.number}: cancelado.`,
        action.meta,
      );
      return commit(state, { data }, { kind: "info", message: "Pedido cancelado." });
    }

    case "SIMULATE_PIX_PAID": {
      const order = getOrder(state.data, action.orderId);
      if (!order) {
        return fail(state, "Pedido não encontrado.");
      }
      if (
        order.payment.method !== "pix_simulated" ||
        order.payment.status !== "awaiting"
      ) {
        return fail(state, "Não há pagamento Pix aguardando confirmação.");
      }
      let data = patchOrder(state.data, order.id, {
        payment: { ...order.payment, status: "paid" },
      });
      data = orderSystemMessage(
        data,
        order,
        `Pagamento via Pix confirmado (simulado) — Pedido ${order.number}.`,
        action.meta,
      );
      return commit(state, { data }, { kind: "success", message: "Pagamento Pix confirmado." });
    }
  }
}
