/**
 * Tipos do catálogo e da disponibilidade de produtos.
 *
 * A disponibilidade é intencionalmente enxuta (não é um ERP de estoque): três
 * modos apenas. As regras que interpretam esses modos vivem em `../domain`.
 */

/** Categoria do cardápio. */
export interface ProductCategory {
  readonly id: string;
  readonly name: string;
  /** Ordem de exibição. */
  readonly order: number;
}

/** Modo de disponibilidade de um produto. */
export type AvailabilityMode = "always_available" | "manual" | "quantity";

/**
 * Estado de disponibilidade de um produto. O formato varia conforme o modo,
 * mas mantemos uma união discriminada simples para tipar com segurança.
 */
export interface ProductAvailability {
  readonly mode: AvailabilityMode;
  /** Usado no modo `manual`: alternância disponível/indisponível. */
  manualAvailable?: boolean;
  /** Usado no modo `quantity`: unidades disponíveis (nunca negativo). */
  quantity?: number;
}

/** Produto do cardápio. */
export interface Product {
  readonly id: string;
  readonly categoryId: string;
  readonly name: string;
  readonly description?: string;
  /** Preço em centavos (determinístico, nunca definido pela IA). */
  readonly priceCents: number;
  /** Produto ativo no cardápio. Produto inativo nunca é ofertável. */
  readonly active: boolean;
  availability: ProductAvailability;
}
