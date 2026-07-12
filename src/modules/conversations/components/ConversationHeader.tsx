"use client";

import { useState } from "react";
import { ArrowLeft, Bot, LogOut, RotateCcw, Send, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatMaskedPhone } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import {
  canReopenConversation,
  canResolveConversation,
  canReturnConversationToAI,
  canTakeOverConversation,
  isConversationTransitionAllowed,
} from "../domain/transitions";
import type { Conversation } from "../types";
import type { Customer } from "@/modules/customers/types";
import { ConversationStatusBadge } from "./ConversationStatusBadge";

/** Cabeçalho da conversa com dados do cliente e ações contextuais. */
export function ConversationHeader({
  conversation,
  customer,
  onBack,
}: {
  conversation: Conversation;
  customer: Customer | undefined;
  onBack?: () => void;
}) {
  const { actions } = useDemo();
  const [confirmResolve, setConfirmResolve] = useState(false);

  const canTakeOver =
    canTakeOverConversation(conversation.status) &&
    conversation.responsible !== "human";
  const canReturn = canReturnConversationToAI(conversation.status);
  const canTransfer = isConversationTransitionAllowed(conversation.status, "transferred");
  const canResolve = canResolveConversation(conversation.status);
  const canReopen = canReopenConversation(conversation.status);

  return (
    <header className="border-b border-subtle bg-surface-1/50 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Voltar para a lista"
              className="rounded-lg p-1.5 text-low hover:bg-white/[0.06] hover:text-hi lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
          <Avatar name={customer?.name ?? "Cliente"} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-hi">
              {customer?.name ?? "Cliente"}
            </p>
            <p className="truncate text-xs text-low">
              {customer ? formatMaskedPhone(customer.phone) : ""}
              {conversation.assignedOperator ? ` · ${conversation.assignedOperator}` : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`hidden items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:inline-flex ${
              conversation.responsible === "ai"
                ? "border-ok/30 bg-ok/10 text-ok"
                : conversation.responsible === "human"
                  ? "border-info/30 bg-info/10 text-info"
                  : "border-line text-low"
            }`}
          >
            {conversation.responsible === "ai" ? (
              <Bot className="h-3 w-3" aria-hidden />
            ) : conversation.responsible === "human" ? (
              <UserCheck className="h-3 w-3" aria-hidden />
            ) : null}
            {conversation.responsible === "ai"
              ? "IA"
              : conversation.responsible === "human"
                ? "Humano"
                : "—"}
          </span>
          <ConversationStatusBadge status={conversation.status} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {canTakeOver ? (
          <Button size="sm" variant="primary" onClick={() => actions.takeOver(conversation.id)}>
            <UserCheck className="h-3.5 w-3.5" aria-hidden />
            Assumir atendimento
          </Button>
        ) : null}
        {canReturn ? (
          <Button
            size="sm"
            variant={canTakeOver ? "secondary" : "primary"}
            onClick={() => actions.returnToAI(conversation.id)}
          >
            <Bot className="h-3.5 w-3.5" aria-hidden />
            Devolver p/ IA
          </Button>
        ) : null}
        {canTransfer ? (
          <Button size="sm" variant="ghost" onClick={() => actions.transferConversation(conversation.id)}>
            <Send className="h-3.5 w-3.5" aria-hidden />
            Transferir
          </Button>
        ) : null}
        {canResolve ? (
          <Button size="sm" variant="ghost" onClick={() => setConfirmResolve(true)}>
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Encerrar
          </Button>
        ) : null}
        {canReopen ? (
          <Button size="sm" variant="primary" onClick={() => actions.reopenConversation(conversation.id)}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reabrir
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmResolve}
        title="Encerrar conversa?"
        description="A conversa será marcada como resolvida. Você poderá reabri-la depois."
        confirmLabel="Encerrar"
        onCancel={() => setConfirmResolve(false)}
        onConfirm={() => {
          actions.resolveConversation(conversation.id);
          setConfirmResolve(false);
        }}
      />
    </header>
  );
}
