/**
 * Ativação condicional de módulos por segmento de negócio.
 *
 * Espelha, no TypeScript, a mesma decisão da função SQL
 * `create_organization_with_owner`. Manter as duas coerentes é intencional: o
 * banco é a autoridade, e este módulo permite validar/pré-visualizar a mesma
 * regra na aplicação e nos testes, sem duplicar lógica divergente.
 *
 * Regra de produto: negócios de serviço NÃO recebem estoque, fila de preparo ou
 * entrega automaticamente. Comércio/alimentação recebem catálogo e pedidos.
 */

import type { AppModule, BusinessType } from "@/lib/supabase/database.types";

/** Módulos habilitados por padrão para cada segmento. */
export const DEFAULT_MODULES_BY_BUSINESS_TYPE: Readonly<
  Record<BusinessType, readonly AppModule[]>
> = {
  food_service: [
    "conversations",
    "customers",
    "catalog",
    "product_availability",
    "orders",
    "preparation_queue",
    "delivery",
    "agent_configuration",
  ],
  retail: [
    "conversations",
    "customers",
    "catalog",
    "product_availability",
    "orders",
    "delivery",
    "agent_configuration",
  ],
  services: ["conversations", "customers", "agent_configuration"],
  other: ["conversations", "customers", "agent_configuration"],
};

/** Rótulos legíveis (pt-BR) dos módulos habilitáveis. */
export const MODULE_LABELS: Readonly<Record<AppModule, string>> = {
  conversations: "Atendimento",
  customers: "Clientes",
  catalog: "Catálogo",
  product_availability: "Disponibilidade",
  orders: "Pedidos",
  preparation_queue: "Fila de preparo",
  delivery: "Entrega",
  agent_configuration: "Configuração da IA",
};

/** Retorna os módulos padrão para um segmento (cópia imutável). */
export function defaultModulesFor(type: BusinessType): readonly AppModule[] {
  return DEFAULT_MODULES_BY_BUSINESS_TYPE[type];
}

/** `true` se o módulo está na lista de habilitados. */
export function isAppModuleEnabled(
  module: AppModule,
  enabled: readonly AppModule[],
): boolean {
  return enabled.includes(module);
}
