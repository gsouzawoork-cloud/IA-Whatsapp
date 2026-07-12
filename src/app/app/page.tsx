import Link from "next/link";
import { CheckCircle2, Circle, Package, MapPin, Bot, Users } from "lucide-react";
import { requireOrganizationContext } from "@/core/context/current";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { MODULE_LABELS } from "@/core/business/modules";

async function countFor(
  table: "products" | "delivery_zones" | "customers" | "orders" | "conversations",
  organizationId: string,
): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);
  return count ?? 0;
}

/** Visão geral REAL: sem números fictícios — apenas dados da organização ativa. */
export default async function AppOverviewPage() {
  const ctx = await requireOrganizationContext();
  const [products, zones, customers, orders] = await Promise.all([
    countFor("products", ctx.organizationId),
    countFor("delivery_zones", ctx.organizationId),
    countFor("customers", ctx.organizationId),
    countFor("orders", ctx.organizationId),
  ]);

  const hasCatalog = ctx.enabledModules.includes("catalog");
  const hasDelivery = ctx.enabledModules.includes("delivery");

  const checklist: { done: boolean; label: string; href: string }[] = [
    ...(hasCatalog
      ? [{ done: products > 0, label: "Cadastrar produtos no catálogo", href: "/app/produtos" }]
      : []),
    ...(hasDelivery
      ? [{ done: zones > 0, label: "Configurar zonas de entrega", href: "/app/entrega" }]
      : []),
    { done: true, label: "Configurar o comportamento da IA", href: "/app/configuracoes/ia" },
  ];

  const metrics = [
    { label: "Produtos", value: products, icon: Package, show: hasCatalog },
    { label: "Zonas de entrega", value: zones, icon: MapPin, show: hasDelivery },
    { label: "Clientes", value: customers, icon: Users, show: true },
    { label: "Pedidos", value: orders, icon: Bot, show: ctx.enabledModules.includes("orders") },
  ].filter((m) => m.show);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow={ctx.organizationName}
        title="Visão geral"
        description={`Unidade ativa: ${ctx.unitName ?? "—"}. Dados reais da sua empresa.`}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="panel elev-low rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-low">{m.label}</span>
                <Icon className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <p className="num mt-2 text-2xl font-bold text-hi">{m.value}</p>
            </div>
          );
        })}
      </div>

      <SectionCard title="Primeiros passos" description="Complete a configuração para começar a operar.">
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-lg border border-subtle px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.03]"
              >
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-good" aria-hidden />
                ) : (
                  <Circle className="h-4 w-4 text-low" aria-hidden />
                )}
                <span className={item.done ? "text-mid" : "font-medium text-hi"}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Módulos habilitados">
        <div className="flex flex-wrap gap-2">
          {ctx.enabledModules.map((m) => (
            <span key={m} className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs text-mid">
              {MODULE_LABELS[m]}
            </span>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
