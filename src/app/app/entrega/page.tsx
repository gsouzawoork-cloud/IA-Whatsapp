import { MapPin } from "lucide-react";
import { requireOrganizationContext } from "@/core/context/current";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseDeliveryRepository } from "@/core/data/supabase/delivery";
import { canManageDelivery } from "@/core/auth/authorize";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import { ZoneCreateForm } from "@/components/app/ZoneCreateForm";
import { toggleZoneActive } from "./actions";

/** Zonas de entrega REAIS. Frete determinístico — nunca inventado. */
export default async function EntregaPage() {
  const ctx = await requireOrganizationContext();
  const canManage = canManageDelivery({ role: ctx.role, status: ctx.status });

  const supabase = await createSupabaseServerClient();
  const repo = createSupabaseDeliveryRepository(supabase, ctx.organizationId, ctx.unitId);
  const zones = await repo.listZones();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Entrega"
        description="Zonas, taxas e prazos. A cotação de frete usa apenas estas zonas cadastradas."
      />

      {canManage ? (
        <SectionCard title="Nova zona">
          <ZoneCreateForm />
        </SectionCard>
      ) : null}

      <SectionCard title={`Zonas (${zones.length})`}>
        {zones.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Nenhuma zona cadastrada"
            description={canManage ? "Cadastre a primeira zona acima." : "Ainda não há zonas de entrega."}
          />
        ) : (
          <ul className="divide-y divide-subtle">
            {zones.map((z) => (
              <li key={z.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-hi">{z.name}</p>
                  <p className="truncate text-xs text-low">
                    {z.neighborhoods.join(", ") || "Sem bairros"} · Taxa {formatCurrency(z.deliveryFeeCents)} · Mín {formatCurrency(z.minimumOrderCents)} · {z.estimatedMinMinutes}–{z.estimatedMaxMinutes} min
                    {z.isActive ? "" : " · inativa"}
                  </p>
                </div>
                {canManage ? (
                  <form action={toggleZoneActive}>
                    <input type="hidden" name="id" value={z.id} />
                    <input type="hidden" name="nextActive" value={String(!z.isActive)} />
                    <button
                      type="submit"
                      className="rounded-lg border border-strong px-2.5 py-1.5 text-xs font-semibold text-mid hover:bg-white/[0.06] hover:text-hi"
                    >
                      {z.isActive ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
