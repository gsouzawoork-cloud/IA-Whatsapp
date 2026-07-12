"use client";

import { MessagesSquare, Sparkles } from "lucide-react";
import { AiAmbient } from "@/components/ui/AiAmbient";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { listConversations } from "@/modules/demo/state/selectors";

/** Estado vazio premium do workspace de atendimento (com atalho de prioridade). */
export function WorkspaceEmptyState() {
  const { state, actions } = useDemo();
  const priority = listConversations(state.data, "attention", "")[0];
  const customer = priority
    ? state.data.customers.find((c) => c.id === priority.customerId)
    : undefined;

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-raised/40 p-8">
      <AiAmbient className="opacity-80" />
      <div className="relative z-10 flex max-w-sm flex-col items-center text-center">
        <span className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/25 bg-accent-soft text-accent card-object">
          <MessagesSquare className="h-7 w-7" aria-hidden />
          <span className="pulse-dot absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent" aria-hidden />
        </span>
        <h2 className="t-page-title text-lg">Estação de atendimento</h2>
        <p className="mt-2 text-sm leading-relaxed text-mid">
          Selecione uma conversa para operar com a IA, assumir o atendimento e
          montar pedidos — tudo em um só lugar.
        </p>

        {priority ? (
          <div className="mt-6 w-full">
            <p className="t-eyebrow mb-2 flex items-center justify-center gap-1.5 text-[10px] uppercase">
              <Sparkles className="h-3 w-3 text-accent" aria-hidden />
              Prioridade sugerida
            </p>
            <Button
              variant="secondary"
              className="w-full justify-start gap-2.5"
              onClick={() => actions.selectConversation(priority.id)}
            >
              <Avatar name={customer?.name ?? "Cliente"} size="sm" />
              <span className="flex-1 truncate text-left">{customer?.name ?? "Cliente"}</span>
              <span className="text-xs text-low">Abrir</span>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
