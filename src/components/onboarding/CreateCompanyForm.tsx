"use client";

import { useActionState } from "react";
import { createOrganizationAction, type OnboardingState } from "@/app/onboarding/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { FormAlert } from "@/components/auth/FormShell";

const initial: OnboardingState = {};
const inputCls =
  "w-full rounded-lg border border-strong bg-white/[0.03] px-3 py-2 text-sm text-hi outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/30";

/** Passo 1 do onboarding: cria a empresa (transacional). */
export function CreateCompanyForm() {
  const [state, action] = useActionState(createOrganizationAction, initial);

  return (
    <form action={action} className="space-y-3">
      <FormAlert error={state.error} />
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-mid">Nome da empresa</span>
        <input name="displayName" required className={inputCls} placeholder="Ex.: Pizzaria Forno Alto" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-mid">Tipo de negócio</span>
        <select name="businessType" defaultValue="food_service" className={inputCls}>
          <option value="food_service" className="bg-neutral-900">Alimentação / delivery</option>
          <option value="retail" className="bg-neutral-900">Varejo / comércio</option>
          <option value="services" className="bg-neutral-900">Serviços</option>
          <option value="other" className="bg-neutral-900">Outro</option>
        </select>
      </label>
      <p className="text-[11px] text-low">
        Os módulos serão habilitados automaticamente conforme o segmento (serviços não recebem estoque/entrega por padrão).
      </p>
      <SubmitButton label="Criar empresa" />
    </form>
  );
}
