"use client";

import { useState } from "react";
import { Bot, Send, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDemo } from "@/modules/demo/state/DemoProvider";

/** Caixa de envio de mensagem manual (atendente), com indicador do modo da IA. */
export function MessageComposer({
  conversationId,
  disabled = false,
  aiActive = false,
}: {
  conversationId: string;
  disabled?: boolean;
  aiActive?: boolean;
}) {
  const { actions } = useDemo();
  const [value, setValue] = useState("");

  function submit() {
    const content = value.trim();
    if (!content) {
      return;
    }
    actions.sendMessage(conversationId, content);
    setValue("");
  }

  return (
    <div className="border-t border-subtle bg-surface-1/50 p-3">
      {!disabled ? (
        <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] text-low">
          {aiActive ? (
            <>
              <Bot className="h-3 w-3 text-ok" aria-hidden />
              IA ativa nesta conversa — enviar manualmente registra sua intervenção.
            </>
          ) : (
            <>
              <UserCheck className="h-3 w-3 text-info" aria-hidden />
              Atendimento manual — a IA está pausada.
            </>
          )}
        </p>
      ) : null}
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label className="flex-1">
          <span className="sr-only">Mensagem</span>
          <textarea
            value={value}
            disabled={disabled}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={disabled ? "Conversa encerrada" : "Escreva uma mensagem manual…"}
            className="field max-h-32 w-full resize-none rounded-xl px-3.5 py-2.5 text-sm text-hi placeholder:text-low disabled:opacity-50"
          />
        </label>
        <Button type="submit" variant="primary" disabled={disabled || !value.trim()}>
          <Send className="h-4 w-4" aria-hidden />
          <span className="sr-only sm:not-sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
