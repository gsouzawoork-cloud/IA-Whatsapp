/**
 * Ferramenta determinística: busca no catálogo (catalog.search).
 *
 * Retorna apenas produtos ATIVOS da organização/unidade do contexto, com preço
 * OFICIAL (do banco) e disponibilidade. Aqui ficam o schema de entrada e a
 * filtragem pura; a leitura dos dados vem do repositório sob RLS.
 */

import { z } from "zod";
import {
  checkAvailability,
  type AvailabilitySnapshot,
} from "./checkAvailability";

export const catalogSearchInput = z.object({
  unitId: z.string().uuid(),
  query: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
});
export type CatalogSearchInput = z.infer<typeof catalogSearchInput>;

/** Produto do catálogo já com preço oficial e disponibilidade resolvida. */
export interface CatalogSearchRow extends AvailabilitySnapshot {
  readonly priceCents: number;
}

export interface CatalogSearchResultItem {
  readonly productId: string;
  readonly name: string;
  readonly category: string;
  readonly priceCents: number;
  readonly available: boolean;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/** Filtra e projeta o catálogo conforme a busca (puro/determinístico). */
export function searchCatalog(
  rows: readonly CatalogSearchRow[],
  input: CatalogSearchInput,
): readonly CatalogSearchResultItem[] {
  const q = input.query ? normalize(input.query) : null;
  const cat = input.category ? normalize(input.category) : null;

  return rows
    .filter((r) => r.isActive)
    .filter((r) => (cat ? normalize(r.category) === cat : true))
    .filter((r) => (q ? normalize(r.name).includes(q) : true))
    .map((r) => ({
      productId: r.productId,
      name: r.name,
      category: r.category,
      priceCents: r.priceCents,
      available: checkAvailability(r, {
        productId: r.productId,
        quantity: 1,
        unitId: input.unitId,
      }).available,
    }));
}
