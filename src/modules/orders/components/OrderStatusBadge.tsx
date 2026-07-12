import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { ORDER_STATUS_LABELS } from "../labels";
import type { OrderStatus } from "../types";

const TONE: Readonly<Record<OrderStatus, BadgeTone>> = {
  draft: "neutral",
  awaiting_information: "warning",
  awaiting_confirmation: "warning",
  awaiting_payment: "warning",
  confirmed: "info",
  preparing: "info",
  ready: "accent",
  out_for_delivery: "info",
  delivered: "success",
  cancelled: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={TONE[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
