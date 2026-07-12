import type { Product, ProductCategory } from "@/modules/catalog/types";

/** Categorias do cardápio simulado. */
export const demoCategories: readonly ProductCategory[] = [
  { id: "cat-pizzas-salgadas", name: "Pizzas salgadas", order: 1 },
  { id: "cat-pizzas-doces", name: "Pizzas doces", order: 2 },
  { id: "cat-bebidas", name: "Bebidas", order: 3 },
  { id: "cat-adicionais", name: "Adicionais", order: 4 },
  { id: "cat-sobremesas", name: "Sobremesas", order: 5 },
];

/**
 * Cardápio simulado com os três modos de disponibilidade representados:
 * `always_available`, `manual` (disponível e indisponível) e `quantity`
 * (com estoque normal, baixo e zerado).
 */
export const demoProducts: readonly Product[] = [
  {
    id: "prod-marguerita",
    categoryId: "cat-pizzas-salgadas",
    name: "Pizza Marguerita",
    description: "Molho de tomate, muçarela, tomate e manjericão fresco.",
    priceCents: 4790,
    active: true,
    availability: { mode: "always_available" },
  },
  {
    id: "prod-calabresa",
    categoryId: "cat-pizzas-salgadas",
    name: "Pizza Calabresa",
    description: "Calabresa fatiada, cebola e muçarela.",
    priceCents: 4990,
    active: true,
    availability: { mode: "manual", manualAvailable: true },
  },
  {
    id: "prod-portuguesa",
    categoryId: "cat-pizzas-salgadas",
    name: "Pizza Portuguesa",
    description: "Presunto, ovo, cebola, ervilha e muçarela.",
    priceCents: 5290,
    active: true,
    availability: { mode: "manual", manualAvailable: false },
  },
  {
    id: "prod-quatro-queijos",
    categoryId: "cat-pizzas-salgadas",
    name: "Pizza Quatro Queijos",
    description: "Muçarela, provolone, parmesão e gorgonzola.",
    priceCents: 5490,
    active: true,
    availability: { mode: "manual", manualAvailable: true },
  },
  {
    id: "prod-frango-catupiry",
    categoryId: "cat-pizzas-salgadas",
    name: "Pizza Frango com Catupiry",
    description: "Frango desfiado temperado e catupiry.",
    priceCents: 5390,
    active: true,
    availability: { mode: "manual", manualAvailable: true },
  },
  {
    id: "prod-chocolate",
    categoryId: "cat-pizzas-doces",
    name: "Pizza de Chocolate",
    description: "Chocolate ao leite com granulado.",
    priceCents: 4590,
    active: true,
    availability: { mode: "always_available" },
  },
  {
    id: "prod-coca-lata",
    categoryId: "cat-bebidas",
    name: "Coca-Cola lata 350ml",
    priceCents: 700,
    active: true,
    availability: { mode: "quantity", quantity: 24 },
  },
  {
    id: "prod-coca-2l",
    categoryId: "cat-bebidas",
    name: "Coca-Cola 2L",
    priceCents: 1400,
    active: true,
    availability: { mode: "quantity", quantity: 0 },
  },
  {
    id: "prod-guarana-2l",
    categoryId: "cat-bebidas",
    name: "Guaraná 2L",
    priceCents: 1200,
    active: true,
    availability: { mode: "quantity", quantity: 9 },
  },
  {
    id: "prod-agua",
    categoryId: "cat-bebidas",
    name: "Água mineral 500ml",
    priceCents: 400,
    active: true,
    availability: { mode: "quantity", quantity: 30 },
  },
  {
    id: "prod-borda-catupiry",
    categoryId: "cat-adicionais",
    name: "Borda recheada de catupiry",
    priceCents: 900,
    active: true,
    availability: { mode: "manual", manualAvailable: true },
  },
  {
    id: "prod-borda-cheddar",
    categoryId: "cat-adicionais",
    name: "Borda recheada de cheddar",
    priceCents: 900,
    active: true,
    availability: { mode: "manual", manualAvailable: true },
  },
  {
    id: "prod-petit-gateau",
    categoryId: "cat-sobremesas",
    name: "Petit gâteau com sorvete",
    priceCents: 1890,
    active: true,
    availability: { mode: "quantity", quantity: 6 },
  },
  {
    id: "prod-brownie",
    categoryId: "cat-sobremesas",
    name: "Brownie com doce de leite",
    priceCents: 1490,
    active: true,
    availability: { mode: "quantity", quantity: 3 },
  },
];
