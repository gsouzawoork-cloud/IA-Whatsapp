/**
 * Implementação Demo do CatalogRepository.
 *
 * Lê do cardápio simulado (dados fictícios da pizzaria) e mantém as mutações em
 * memória. Serve para: (1) demonstrar o mesmo contrato usado pelo Supabase;
 * (2) manter o modo demonstração vivo sem banco. NUNCA compartilha estado com o
 * modo real — dados demo e dados reais não se misturam.
 */

import { demoCategories } from "@/data/demo/products";
import { demoProducts } from "@/data/demo/products";
import type { Product } from "@/modules/catalog/types";
import type {
  CatalogProduct,
  CatalogRepository,
  NewCatalogProduct,
} from "../contracts";

function categoryName(categoryId: string): string {
  return demoCategories.find((c) => c.id === categoryId)?.name ?? "";
}

function toCatalogProduct(p: Product): CatalogProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    category: categoryName(p.categoryId),
    priceCents: p.priceCents,
    isActive: p.active,
    availabilityMode: p.availability.mode,
  };
}

export function createDemoCatalogRepository(): CatalogRepository {
  // Estado local isolado desta instância (não persiste, não vaza para o real).
  const products = new Map<string, CatalogProduct>(
    demoProducts.map((p) => [p.id, toCatalogProduct(p)]),
  );

  return {
    async listProducts() {
      return [...products.values()].sort((a, b) => a.name.localeCompare(b.name));
    },
    async createProduct(input: NewCatalogProduct) {
      const created: CatalogProduct = {
        id: `demo-${products.size + 1}`,
        name: input.name,
        description: input.description ?? "",
        category: input.category ?? "",
        priceCents: input.priceCents,
        isActive: true,
        availabilityMode: input.availabilityMode ?? "always_available",
      };
      products.set(created.id, created);
      return created;
    },
    async setProductActive(id: string, isActive: boolean) {
      const current = products.get(id);
      if (current) {
        products.set(id, { ...current, isActive });
      }
    },
  };
}
