"use client";

import { useActionState } from "react";
import { saveAgentSettingsAction, type FormState } from "@/app/app/configuracoes/ia/actions";
import type { AgentSettings } from "@/core/data/contracts";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { FormAlert } from "@/components/auth/FormShell";

const initial: FormState = {};
const inputCls =
  "w-full rounded-lg border border-strong bg-white/[0.03] px-3 py-2 text-sm text-hi outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/30";

const CAPABILITIES: { name: keyof AgentSettings; label: string }[] = [
  { name: "canSearchCatalog", label: "Buscar no catálogo" },
  { name: "canCheckAvailability", label: "Verificar disponibilidade" },
  { name: "canQuoteDelivery", label: "Cotar entrega" },
  { name: "canCreateOrderDraft", label: "Criar rascunho de pedido" },
  { name: "canInformOrderStatus", label: "Informar status de pedido" },
  { name: "canSuggestAlternatives", label: "Sugerir alternativas" },
];

/** Formulário de configuração do agente (comportamento + capacidades). */
export function AgentSettingsForm({
  settings,
  canManage,
}: {
  settings: AgentSettings;
  canManage: boolean;
}) {
  const [state, action] = useActionState(saveAgentSettingsAction, initial);
  const disabled = !canManage;

  return (
    <form action={action} className="space-y-4">
      <FormAlert error={state.error} notice={state.ok ? "Configuração salva." : undefined} />
      <fieldset disabled={disabled} className="space-y-4 disabled:opacity-60">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-mid">Nome do agente</span>
            <input name="agentName" defaultValue={settings.agentName} required className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-mid">Tom</span>
            <input name="tone" defaultValue={settings.tone} className={inputCls} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-mid">Mensagem de apresentação</span>
          <textarea name="introductionMessage" defaultValue={settings.introductionMessage} rows={3} className={inputCls} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-mid">Formalidade (1–5)</span>
            <input name="formalityLevel" type="number" min={1} max={5} defaultValue={settings.formalityLevel} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-mid">Uso de emojis</span>
            <select name="emojiUsage" defaultValue={settings.emojiUsage} className={inputCls}>
              <option value="none" className="bg-neutral-900">Nenhum</option>
              <option value="moderate" className="bg-neutral-900">Moderado</option>
              <option value="frequent" className="bg-neutral-900">Frequente</option>
            </select>
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-mid">Comportamento</p>
          <label className="flex items-center gap-2 text-sm text-mid">
            <input type="checkbox" name="automaticServiceEnabled" defaultChecked={settings.automaticServiceEnabled} className="accent-[color:var(--accent,#4ec5e0)]" />
            Atendimento automático habilitado
          </label>
          <label className="flex items-center gap-2 text-sm text-mid">
            <input type="checkbox" name="humanHandoffEnabled" defaultChecked={settings.humanHandoffEnabled} className="accent-[color:var(--accent,#4ec5e0)]" />
            Permitir transferência para humano
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-mid">Capacidades permitidas</p>
          <p className="text-[11px] text-low">
            Ações críticas (alterar preço, aplicar desconto, confirmar pagamento, reembolso, cancelar, alterar taxa) permanecem bloqueadas por design.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CAPABILITIES.map((cap) => (
              <label key={String(cap.name)} className="flex items-center gap-2 text-sm text-mid">
                <input
                  type="checkbox"
                  name={String(cap.name)}
                  defaultChecked={settings[cap.name] as boolean}
                  className="accent-[color:var(--accent,#4ec5e0)]"
                />
                {cap.label}
              </label>
            ))}
          </div>
        </div>
      </fieldset>
      {canManage ? <SubmitButton label="Salvar configuração" /> : (
        <p className="text-xs text-low">Você não tem permissão para editar esta configuração.</p>
      )}
    </form>
  );
}
