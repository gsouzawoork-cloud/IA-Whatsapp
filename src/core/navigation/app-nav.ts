/**
 * Navegação da aplicação REAL, derivada dos módulos habilitados da organização.
 *
 * A navegação nunca é apenas "escondida com CSS": ela é COMPUTADA a partir de
 * uma fonte central tipada (módulos habilitados). Um item de módulo desativado
 * simplesmente não existe na lista. Isso mantém a UI coerente com a autorização
 * real (RLS + permissões).
 */

import type { AppModule } from "@/lib/supabase/database.types";

export type NavigationIconKey =
  | "dashboard"
  | "messages"
  | "orders"
  | "queue"
  | "products"
  | "delivery"
  | "customers"
  | "agent"
  | "company"
  | "units";

export interface NavigationItem {
  readonly href: string;
  readonly label: string;
  readonly iconKey: NavigationIconKey;
  readonly mobilePrimary?: boolean;
}

type NavigationDefinition = NavigationItem & {
  /** Módulo exigido; ausente = sempre visível (núcleo). */
  readonly module?: AppModule;
};

export type AppNavItem = NavigationItem;

const ALL_ITEMS: readonly NavigationDefinition[] = [
  { href: "/app", label: "Visão geral", iconKey: "dashboard", mobilePrimary: true },
  { href: "/app/atendimento", label: "Atendimento", iconKey: "messages", module: "conversations", mobilePrimary: true },
  { href: "/app/pedidos", label: "Pedidos", iconKey: "orders", module: "orders", mobilePrimary: true },
  { href: "/app/fila", label: "Fila de preparo", iconKey: "queue", module: "preparation_queue", mobilePrimary: false },
  { href: "/app/produtos", label: "Produtos", iconKey: "products", module: "catalog", mobilePrimary: false },
  { href: "/app/entrega", label: "Entrega", iconKey: "delivery", module: "delivery", mobilePrimary: false },
  { href: "/app/clientes", label: "Clientes", iconKey: "customers", module: "customers", mobilePrimary: false },
  { href: "/app/configuracoes/ia", label: "Configuração da IA", iconKey: "agent", module: "agent_configuration", mobilePrimary: false },
  { href: "/app/configuracoes/empresa", label: "Empresa", iconKey: "company", mobilePrimary: false },
  { href: "/app/configuracoes/unidades", label: "Unidades", iconKey: "units", mobilePrimary: false },
];

/** Itens de navegação visíveis para o conjunto de módulos habilitados. */
export function navItemsForModules(
  enabledModules: readonly AppModule[],
): readonly NavigationItem[] {
  return ALL_ITEMS.filter(
    (item) => item.module === undefined || enabledModules.includes(item.module),
  ).map(({ href, label, iconKey, mobilePrimary }) => ({
    href,
    label,
    iconKey,
    mobilePrimary,
  }));
}
