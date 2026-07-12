import { requireOrganizationContext } from "@/core/context/current";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canManageOrganization } from "@/core/auth/authorize";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { ROLE_LABELS } from "@/core/auth/roles";

/** Configurações da empresa (dados reais da organização). */
export default async function EmpresaPage() {
  const ctx = await requireOrganizationContext();
  const canManage = canManageOrganization({ role: ctx.role, status: ctx.status });

  const supabase = await createSupabaseServerClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("display_name, legal_name, slug, business_type, email, phone, timezone")
    .eq("id", ctx.organizationId)
    .maybeSingle();

  const rows: { label: string; value: string }[] = [
    { label: "Nome", value: org?.display_name ?? ctx.organizationName },
    { label: "Razão social", value: org?.legal_name ?? "—" },
    { label: "Identificador", value: org?.slug ?? "—" },
    { label: "Segmento", value: org?.business_type ?? "—" },
    { label: "E-mail", value: org?.email ?? "—" },
    { label: "Telefone", value: org?.phone ?? "—" },
    { label: "Fuso horário", value: org?.timezone ?? "—" },
    { label: "Seu papel", value: ROLE_LABELS[ctx.role] },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Empresa" description="Dados cadastrais da organização." />
      <SectionCard title="Informações">
        <dl className="divide-y divide-subtle">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3 py-2.5">
              <dt className="text-xs font-medium text-low">{r.label}</dt>
              <dd className="text-sm font-semibold text-hi">{r.value}</dd>
            </div>
          ))}
        </dl>
        {!canManage ? (
          <p className="mt-3 text-xs text-low">Apenas proprietário/administrador podem alterar estes dados.</p>
        ) : null}
      </SectionCard>
    </div>
  );
}
