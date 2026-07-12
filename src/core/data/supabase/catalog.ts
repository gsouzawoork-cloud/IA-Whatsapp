/**
 * Implementação Supabase do CatalogRepository (sob RLS).
 *
 * O escopo de tenant é imposto pela RLS a partir da sessão; ainda assim
 * filtramos por organization_id explicitamente (defesa em profundidade e
 * clareza de intenção). Nenhuma query confia em IDs vindos do cliente sem que a
 * RLS os valide.
 */

import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type {
  CatalogProduct,
  CatalogRepository,
  NewCatalogProduct,
} from "../contracts";

export function createSupabaseCatalogRepository(
  supabase: TypedSupabaseClient,
  organizationId: string,
  unitId: string | null,
): CatalogRepository {
  return {
    async listProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, category, price_cents, is_active, availability_mode")
        .eq("organization_id", organizationId)
        .order("name", { ascending: true });
      if (error) {
        throw new Error("Não foi possível carregar o catálogo.");
      }
      return (data ?? []).map(mapProduct);
    },

    async createProduct(input: NewCatalogProduct) {
      const { data, error } = await supabase
        .from("products")
        .insert({
          organization_id: organizationId,
          unit_id: unitId,
          name: input.name,
          description: input.description ?? "",
          category: input.category ?? "",
          price_cents: input.priceCents,
          availability_mode: input.availabilityMode ?? "always_available",
        })
        .select("id, name, description, category, price_cents, is_active, availability_mode")
        .single();
      if (error || !data) {
        throw new Error("Não foi possível criar o produto.");
      }
      return mapProduct(data);
    },

    async setProductActive(id: string, isActive: boolean) {
      const { error } = await supabase
        .from("products")
        .update({ is_active: isActive })
        .eq("organization_id", organizationId)
        .eq("id", id);
      if (error) {
        throw new Error("Não foi possível atualizar o produto.");
      }
    },
  };
}

type ProductRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  price_cents: number;
  is_active: boolean;
  availability_mode: CatalogProduct["availabilityMode"];
};

function mapProduct(row: ProductRow): CatalogProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    priceCents: row.price_cents,
    isActive: row.is_active,
    availabilityMode: row.availability_mode,
  };
}
