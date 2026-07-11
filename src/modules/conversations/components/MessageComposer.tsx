"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDemo } from "@/modules/demo/state/DemoProvider";

/** Caixa de envio de mensagem manual (atendente). */
export function MessageComposer({
  conversationId,
  disabled = false,
}: {
  conversationId: string;
  disabled?: boolean;
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
    <form
      className="flex items-end gap-2 border-t border-neutral-800 p-3"
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
          placeholder={
            disabled ? "Conversa encerrada" : "Escreva uma mensagem manual…"
          }
          className="max-h-32 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 disabled:opacity-50"
        />
      </label>
      <Button type="submit" variant="primary" disabled={disabled || !value.trim()}>
        <Send className="h-4 w-4" aria-hidden />
        <span className="sr-only sm:not-sr-only">Enviar</span>
      </Button>
    </form>
  );
}
