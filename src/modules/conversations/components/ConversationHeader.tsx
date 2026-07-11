"use client";

import { useState } from "react";
import { ArrowLeft, Bot, LogOut, RotateCcw, Send, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  const canTransfer = isConversationTransitionAllowed(
    conversation.status,
    "transferred",
  );
  const canResolve = canResolveConversation(conversation.status);
  const canReopen = canReopenConversation(conversation.status);

  return (
    <header className="border-b border-neutral-800 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Voltar para a lista"
              className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-800 lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-100">
              {customer?.name ?? "Cliente"}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {customer ? formatMaskedPhone(customer.phone) : ""}
              {conversation.assignedOperator
                ? ` · ${conversation.assignedOperator}`
                : ""}
            </p>
          </div>
        </div>
        <ConversationStatusBadge status={conversation.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {canTakeOver ? (
          <Button
            size="sm"
            variant="primary"
            onClick={() => actions.takeOver(conversation.id)}
          >
            <UserCheck className="h-3.5 w-3.5" aria-hidden />
            Assumir (pausa IA)
          </Button>
        ) : null}
        {canReturn ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => actions.returnToAI(conversation.id)}
          >
            <Bot className="h-3.5 w-3.5" aria-hidden />
            Devolver p/ IA
          </Button>
        ) : null}
        {canTransfer ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => actions.transferConversation(conversation.id)}
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            Transferir
          </Button>
        ) : null}
        {canResolve ? (
          <Button
            size="sm"
            variant="danger"
            onClick={() => setConfirmResolve(true)}
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Encerrar
          </Button>
        ) : null}
        {canReopen ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => actions.reopenConversation(conversation.id)}
          >
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
