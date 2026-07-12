import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { CONVERSATION_STATUS_LABELS } from "../labels";
import type { ConversationStatus } from "../types";

const TONE: Readonly<Record<ConversationStatus, BadgeTone>> = {
  new: "warning",
  // IA ativa é verde (semântica de sucesso/operação saudável), não o acento cian.
  ai_active: "success",
  waiting_customer: "neutral",
  waiting_human: "danger",
  human_active: "info",
  transferred: "info",
  resolved: "success",
  closed: "neutral",
};

export function ConversationStatusBadge({ status }: { status: ConversationStatus }) {
  return <Badge tone={TONE[status]}>{CONVERSATION_STATUS_LABELS[status]}</Badge>;
}
