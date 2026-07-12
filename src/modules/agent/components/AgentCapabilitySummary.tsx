import { Check, ShieldCheck, X } from "lucide-react";
import type { AgentSettings } from "../types";

/** Resumo de autonomia da IA: o que ela pode e o que nunca pode fazer. */
export function AgentCapabilitySummary({ settings }: { settings: AgentSettings }) {
  const can: { label: string; on: boolean }[] = [
    { label: "Consultar produtos", on: settings.canQueryProducts },
    { label: "Criar rascunho de pedido", on: settings.canDraftOrders },
    { label: "Sugerir alternativas", on: settings.canSuggestAlternatives },
    { label: "Informar status", on: settings.canInformStatus },
  ];
  const cannot: string[] = [
    ...(settings.blockPriceChange ? ["Alterar preços"] : []),
    ...(settings.blockDiscounts ? ["Aplicar descontos"] : []),
    "Confirmar pagamentos por comprovante",
    ...(settings.blockRefunds ? ["Executar reembolsos"] : []),
    ...(settings.blockAutoCancellation ? ["Cancelar pedidos automaticamente"] : []),
  ];

  return (
    <div className="panel-priority rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
          <ShieldCheck className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="t-section text-sm">Autonomia da IA</p>
          <p className="text-[11px] text-low">Governança determinística</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="t-eyebrow mb-2 text-[10px] uppercase text-ok">A IA pode</p>
        <ul className="space-y-1.5">
          {can.map((item) => (
            <li
              key={item.label}
              className={`flex items-center gap-2 text-sm ${item.on ? "text-mid" : "text-dim line-through"}`}
            >
              <Check className={`h-3.5 w-3.5 shrink-0 ${item.on ? "text-ok" : "text-dim"}`} aria-hidden />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 border-t border-subtle pt-4">
        <p className="t-eyebrow mb-2 text-[10px] uppercase text-bad">A IA não pode</p>
        <ul className="space-y-1.5">
          {cannot.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-mid">
              <X className="h-3.5 w-3.5 shrink-0 text-bad" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
