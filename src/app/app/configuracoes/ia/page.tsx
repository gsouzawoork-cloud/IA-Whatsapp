"use client";

import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDateTime } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { demoAgentSettings } from "@/data/demo/agent-settings";
import { AgentCapabilitySummary } from "@/modules/agent/components/AgentCapabilitySummary";
import type { AgentSettings, AgentTone } from "@/modules/agent/types";

const TONES: readonly { value: AgentTone; label: string }[] = [
  { value: "professional", label: "Profissional" },
  { value: "friendly", label: "Amigável" },
  { value: "direct", label: "Direto" },
];

const CAPABILITIES: readonly { key: keyof AgentSettings; label: string }[] = [
  { key: "canQueryProducts", label: "Consultar produtos" },
  { key: "canDraftOrders", label: "Criar rascunho de pedido" },
  { key: "canSuggestAlternatives", label: "Sugerir alternativas" },
  { key: "canInformStatus", label: "Informar status" },
];

const BLOCKS: readonly { key: keyof AgentSettings; label: string }[] = [
  { key: "blockDiscounts", label: "Bloquear descontos" },
  { key: "blockAutoCancellation", label: "Bloquear cancelamento automático" },
  { key: "blockPriceChange", label: "Bloquear alteração de preço" },
  { key: "blockRefunds", label: "Bloquear reembolso" },
];

function fieldClass() {
  return "field mt-1 w-full rounded-lg px-3 py-2 text-sm text-hi";
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-line bg-white/[0.02] px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.04]">
      <span className="text-mid">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--color-accent)]"
      />
    </label>
  );
}

export default function AgentConfigPage() {
  const { state, actions } = useDemo();
  const [form, setForm] = useState<AgentSettings>(state.data.agentSettings);
  const [confirmRestore, setConfirmRestore] = useState(false);

  function update<K extends keyof AgentSettings>(key: K, value: AgentSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(state.data.agentSettings);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 lg:p-8">
      <PageHeader
        eyebrow="Núcleo · Configuração da IA"
        title="Configuração da IA"
        description="Comportamento simulado do agente. A IA não executa ações críticas sem validação."
        actions={<Badge tone="warning" dot>Configuração simulada</Badge>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            actions.updateAgentSettings(form);
          }}
        >
          <SectionCard title="Identidade e tom">
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-low">Nome do agente</span>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className={fieldClass()} />
              </label>
              <label className="block">
                <span className="text-xs text-low">Forma de apresentação</span>
                <textarea
                  value={form.greeting}
                  rows={2}
                  onChange={(e) => update("greeting", e.target.value)}
                  className={`${fieldClass()} resize-none`}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs text-low">Tom de voz</span>
                  <select
                    value={form.tone}
                    onChange={(e) => update("tone", e.target.value as AgentTone)}
                    className={fieldClass()}
                  >
                    {TONES.map((tone) => (
                      <option key={tone.value} value={tone.value}>
                        {tone.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-low">Formalidade: {form.formality}</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={form.formality}
                    onChange={(e) => update("formality", Number(e.target.value))}
                    className="mt-3 w-full accent-[var(--color-accent)]"
                  />
                </label>
              </div>
              <Toggle label="Uso moderado de emojis" checked={form.useEmojis} onChange={(v) => update("useEmojis", v)} />
            </div>
          </SectionCard>

          <SectionCard title="Horários e mensagens automáticas">
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-low">Horário de atendimento automático</span>
                <input value={form.serviceHours} onChange={(e) => update("serviceHours", e.target.value)} className={fieldClass()} />
              </label>
              <label className="block">
                <span className="text-xs text-low">Mensagem fora do horário</span>
                <textarea
                  value={form.offHoursMessage}
                  rows={2}
                  onChange={(e) => update("offHoursMessage", e.target.value)}
                  className={`${fieldClass()} resize-none`}
                />
              </label>
              <label className="block">
                <span className="text-xs text-low">Casos que exigem humano</span>
                <textarea
                  value={form.humanHandoffCases}
                  rows={2}
                  onChange={(e) => update("humanHandoffCases", e.target.value)}
                  className={`${fieldClass()} resize-none`}
                />
              </label>
            </div>
          </SectionCard>

          <SectionCard title="Capacidades" description="Ações que a IA pode solicitar">
            <div className="grid gap-2 sm:grid-cols-2">
              {CAPABILITIES.map((capability) => (
                <Toggle
                  key={capability.key}
                  label={capability.label}
                  checked={form[capability.key] as boolean}
                  onChange={(v) => update(capability.key, v as never)}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Restrições" description="Limites que a IA nunca contorna">
            <div className="grid gap-2 sm:grid-cols-2">
              {BLOCKS.map((block) => (
                <Toggle
                  key={block.key}
                  label={block.label}
                  checked={form[block.key] as boolean}
                  onChange={(v) => update(block.key, v as never)}
                />
              ))}
            </div>
          </SectionCard>

          <div className="panel elev-low sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
            <p className="text-xs text-low">
              {dirty ? (
                <span className="font-semibold text-warn">Alterações não salvas</span>
              ) : (
                <>Última alteração: {formatDateTime(state.data.agentSettings.updatedAt)}</>
              )}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setForm(demoAgentSettings)}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Restaurar padrão
              </Button>
              <Button type="submit" variant="primary" disabled={!dirty}>
                <Save className="h-4 w-4" aria-hidden />
                Salvar
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <AgentCapabilitySummary settings={form} />

          <SectionCard title="Demonstração">
            <p className="text-sm text-low">Restaure todos os dados simulados ao estado inicial.</p>
            <Button variant="danger" className="mt-3 w-full" onClick={() => setConfirmRestore(true)}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Restaurar demonstração
            </Button>
          </SectionCard>
        </div>
      </div>

      <ConfirmDialog
        open={confirmRestore}
        title="Restaurar demonstração?"
        description="Todas as conversas, pedidos e alterações voltam ao estado inicial. Esta ação não pode ser desfeita."
        confirmLabel="Restaurar"
        onCancel={() => setConfirmRestore(false)}
        onConfirm={() => {
          actions.restoreDemo();
          setConfirmRestore(false);
        }}
      />
    </div>
  );
}
