"use client";

import { useActionState, useEffect, useRef } from "react";
import { createZoneAction, type FormState } from "@/app/app/entrega/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { FormAlert } from "@/components/auth/FormShell";

const initial: FormState = {};
const inputCls =
  "w-full rounded-lg border border-strong bg-white/[0.03] px-3 py-2 text-sm text-hi outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/30";

/** Formulário de criação de zona de entrega (real). */
export function ZoneCreateForm() {
  const [state, action] = useActionState(createZoneAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <FormAlert error={state.error} notice={state.ok ? "Zona criada." : undefined} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mid">Nome da zona</span>
          <input name="name" required className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mid">Bairros (separados por vírgula)</span>
          <input name="neighborhoods" placeholder="Centro, Sé" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mid">Taxa de entrega (R$)</span>
          <input name="fee" inputMode="decimal" placeholder="0,00" required className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mid">Pedido mínimo (R$)</span>
          <input name="minimum" inputMode="decimal" placeholder="0,00" required className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mid">Prazo mínimo (min)</span>
          <input name="etaMin" inputMode="numeric" placeholder="30" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mid">Prazo máximo (min)</span>
          <input name="etaMax" inputMode="numeric" placeholder="50" className={inputCls} />
        </label>
      </div>
      <SubmitButton label="Adicionar zona" />
    </form>
  );
}
