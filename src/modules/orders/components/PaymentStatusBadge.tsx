import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { PAYMENT_STATUS_LABELS } from "../labels";
import type { PaymentStatus } from "@/modules/payments/types";

const TONE: Readonly<Record<PaymentStatus, BadgeTone>> = {
  not_started: "neutral",
  awaiting: "warning",
  paid: "success",
  pay_on_delivery: "info",
  failed: "danger",
  expired: "danger",
  cancelled: "danger",
  refunded: "neutral",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={TONE[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}
