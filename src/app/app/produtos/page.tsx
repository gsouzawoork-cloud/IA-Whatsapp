import { Package } from "lucide-react";
import { requireOrganizationContext } from "@/core/context/current";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseCatalogRepository } from "@/core/data/supabase/catalog";
import { canManageCatalog } from "@/core/auth/authorize";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import { ProductCreateForm } from "@/components/app/ProductCreateForm";
import { toggleProductActive } from "./actions";

/** Catálogo REAL da organização (CRUD sob RLS). */
export default async function ProdutosPage() {
  const ctx = await requireOrganizationContext();
  const canManage = canManageCatalog({ role: ctx.role, status: ctx.status });

  const supabase = await createSupabaseServerClient();
  const repo = createSupabaseCatalogRepository(supabase, ctx.organizationId, ctx.unitId);
  const products = await repo.listProducts();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Produtos"
        description="Catálogo real da sua empresa. Preços em reais; a IA nunca altera preço."
      />

      {canManage ? (
        <SectionCard title="Novo produto">
          <ProductCreateForm />
        </SectionCard>
      ) : null}

      <SectionCard title={`Catálogo (${products.length})`}>
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum produto cadastrado"
            description={canManage ? "Adicione o primeiro produto acima." : "Ainda não há produtos neste catálogo."}
          />
        ) : (
          <ul className="divide-y divide-subtle">
            {products.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-hi">{p.name}</p>
                  <p className="truncate text-xs text-low">
                    {p.category || "Sem categoria"} · {formatCurrency(p.priceCents)}
                    {p.isActive ? "" : " · inativo"}
                  </p>
                </div>
                {canManage ? (
                  <form action={toggleProductActive}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="nextActive" value={String(!p.isActive)} />
                    <button
                      type="submit"
                      className="rounded-lg border border-strong px-2.5 py-1.5 text-xs font-semibold text-mid hover:bg-white/[0.06] hover:text-hi"
                    >
                      {p.isActive ? "Desativar" : "Ativar"}
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
