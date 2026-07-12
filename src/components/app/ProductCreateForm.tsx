"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProductAction, type FormState } from "@/app/app/produtos/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { FormAlert } from "@/components/auth/FormShell";

const initial: FormState = {};

/** Formulário de criação de produto (real). Limpa ao concluir com sucesso. */
export function ProductCreateForm() {
  const [state, action] = useActionState(createProductAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <FormAlert error={state.error} notice={state.ok ? "Produto criado." : undefined} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mid">Nome</span>
          <input name="name" required className="w-full rounded-lg border border-strong bg-white/[0.03] px-3 py-2 text-sm text-hi outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/30" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mid">Categoria</span>
          <input name="category" className="w-full rounded-lg border border-strong bg-white/[0.03] px-3 py-2 text-sm text-hi outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/30" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mid">Preço (R$)</span>
          <input name="price" inputMode="decimal" placeholder="0,00" required className="w-full rounded-lg border border-strong bg-white/[0.03] px-3 py-2 text-sm text-hi outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/30" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mid">Disponibilidade</span>
          <select name="availabilityMode" defaultValue="always_available" className="w-full rounded-lg border border-strong bg-white/[0.03] px-3 py-2 text-sm text-hi outline-none focus:border-accent/60">
            <option value="always_available" className="bg-neutral-900">Sempre disponível</option>
            <option value="manual" className="bg-neutral-900">Controle manual</option>
            <option value="quantity" className="bg-neutral-900">Por quantidade</option>
          </select>
        </label>
      </div>
      <SubmitButton label="Adicionar produto" />
    </form>
  );
}
