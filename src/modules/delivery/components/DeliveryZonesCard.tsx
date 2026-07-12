"use client";

import { Info } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDuration } from "@/lib/format";
import { useDemo } from "@/modules/demo/state/DemoProvider";

/**
 * Regras de entrega por zona (frete determinístico). Apresentação somente
 * leitura: deixa explícito que o sistema calcula e a IA apenas consulta.
 */
export function DeliveryZonesCard() {
  const { state } = useDemo();
  const zones = state.data.deliveryZones;

  return (
    <SectionCard
      title="Entrega e regiões"
      description="O sistema calcula o frete por zona; a IA apenas consulta e informa."
    >
      <div className="mb-3 flex items-start gap-2 rounded-lg border border-info/25 bg-info/10 px-3 py-2 text-xs text-info">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        A IA solicita o CEP ou bairro, o sistema identifica a zona e devolve taxa,
        prazo e pedido mínimo. Regiões fora da área exigem um atendente humano.
      </div>

      <ul className="space-y-2">
        {zones.map((zone) => (
          <li
            key={zone.id}
            className="rounded-lg border border-line bg-white/[0.02] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-hi">{zone.name}</span>
              <div className="flex items-center gap-1.5">
                {zone.freeAboveCents !== undefined ? (
                  <Badge tone="accent">
                    Grátis &gt; {formatCurrency(zone.freeAboveCents)}
                  </Badge>
                ) : null}
                <Badge tone={zone.active ? "success" : "neutral"} dot>
                  {zone.active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </div>
            <p className="mt-1 text-xs text-low">
              Bairros: {zone.districts.join(", ")}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="t-eyebrow text-[10px] uppercase">Taxa</p>
                <p className="num font-semibold text-hi">
                  {formatCurrency(zone.feeCents)}
                </p>
              </div>
              <div>
                <p className="t-eyebrow text-[10px] uppercase">Prazo</p>
                <p className="font-semibold text-hi">
                  {formatDuration(zone.etaMinMinutes)}–{formatDuration(zone.etaMaxMinutes)}
                </p>
              </div>
              <div>
                <p className="t-eyebrow text-[10px] uppercase">Mínimo</p>
                <p className="num font-semibold text-hi">
                  {formatCurrency(zone.minOrderCents)}
                </p>
              </div>
            </div>
          </li>
        ))}
        <li className="rounded-lg border border-warn/25 bg-warn/[0.06] px-3 py-2 text-xs text-warn">
          Fora dessas zonas: a IA não confirma a entrega e encaminha para atendimento humano.
        </li>
      </ul>
    </SectionCard>
  );
}
