import { Store } from "lucide-react";
import { requireOrganizationContext } from "@/core/context/current";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { EmptyState } from "@/components/ui/EmptyState";

/** Unidades da organização (acessíveis ao usuário atual). */
export default async function UnidadesPage() {
  const ctx = await requireOrganizationContext();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Unidades" description="Filiais e unidades operacionais da empresa." />
      <SectionCard title={`Unidades (${ctx.units.length})`}>
        {ctx.units.length === 0 ? (
          <EmptyState icon={Store} title="Nenhuma unidade acessível" description="Você não tem acesso a nenhuma unidade nesta empresa." />
        ) : (
          <ul className="divide-y divide-subtle">
            {ctx.units.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm font-semibold text-hi">{u.name}</span>
                {u.id === ctx.unitId ? (
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    Ativa
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
