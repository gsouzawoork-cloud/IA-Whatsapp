"use client";

import { useState } from "react";
import { RotateCcw, Save, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDateTime } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { demoAgentSettings } from "@/data/demo/agent-settings";
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
    <label className="flex items-center justify-between gap-3 rounded-md border border-neutral-800 px-3 py-2 text-sm">
      <span className="text-neutral-200">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-emerald-500"
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

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 lg:p-6">
      <PageHeader
        title="Configuração da IA"
        description="Comportamento simulado do agente. A IA não executa ações críticas sem validação."
        actions={<Badge tone="warning">Configuração simulada</Badge>}
      />

      <div className="flex flex-wrap items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-200">
        <ShieldCheck className="h-4 w-4" aria-hidden />
        A IA solicita ações; o backend valida e executa. Preço, disponibilidade e
        pagamento são determinísticos.
      </div>

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
              <span className="text-xs text-neutral-500">Nome do agente</span>
              <input
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500/50 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-neutral-500">Forma de apresentação</span>
              <textarea
                value={form.greeting}
                rows={2}
                onChange={(event) => update("greeting", event.target.value)}
                className="mt-1 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500/50 focus:outline-none"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-neutral-500">Tom de voz</span>
                <select
                  value={form.tone}
                  onChange={(event) => update("tone", event.target.value as AgentTone)}
                  className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500/50 focus:outline-none"
                >
                  {TONES.map((tone) => (
                    <option key={tone.value} value={tone.value}>
                      {tone.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-neutral-500">
                  Formalidade: {form.formality}
                </span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={form.formality}
                  onChange={(event) => update("formality", Number(event.target.value))}
                  className="mt-3 w-full accent-emerald-500"
                />
              </label>
            </div>
            <Toggle
              label="Uso moderado de emojis"
              checked={form.useEmojis}
              onChange={(value) => update("useEmojis", value)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Atendimento">
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs text-neutral-500">Horário de atendimento automático</span>
              <input
                value={form.serviceHours}
                onChange={(event) => update("serviceHours", event.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500/50 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-neutral-500">Mensagem fora do horário</span>
              <textarea
                value={form.offHoursMessage}
                rows={2}
                onChange={(event) => update("offHoursMessage", event.target.value)}
                className="mt-1 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500/50 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-neutral-500">Casos que exigem humano</span>
              <textarea
                value={form.humanHandoffCases}
                rows={2}
                onChange={(event) => update("humanHandoffCases", event.target.value)}
                className="mt-1 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500/50 focus:outline-none"
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Ações permitidas">
          <div className="grid gap-2 sm:grid-cols-2">
            {CAPABILITIES.map((capability) => (
              <Toggle
                key={capability.key}
                label={capability.label}
                checked={form[capability.key] as boolean}
                onChange={(value) => update(capability.key, value as never)}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Bloqueios de segurança">
          <div className="grid gap-2 sm:grid-cols-2">
            {BLOCKS.map((block) => (
              <Toggle
                key={block.key}
                label={block.label}
                checked={form[block.key] as boolean}
                onChange={(value) => update(block.key, value as never)}
              />
            ))}
          </div>
        </SectionCard>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            Última alteração: {formatDateTime(state.data.agentSettings.updatedAt)}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm(demoAgentSettings)}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Restaurar padrão
            </Button>
            <Button type="submit" variant="primary">
              <Save className="h-4 w-4" aria-hidden />
              Salvar
            </Button>
          </div>
        </div>
      </form>

      <SectionCard title="Demonstração">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-400">
            Restaure todos os dados simulados ao estado inicial.
          </p>
          <Button variant="danger" onClick={() => setConfirmRestore(true)}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Restaurar demonstração
          </Button>
        </div>
      </SectionCard>

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
