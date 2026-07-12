/**
 * Navegação da aplicação REAL, derivada dos módulos habilitados da organização.
 *
 * A navegação nunca é apenas "escondida com CSS": ela é COMPUTADA a partir de
 * uma fonte central tipada (módulos habilitados). Um item de módulo desativado
 * simplesmente não existe na lista. Isso mantém a UI coerente com a autorização
 * real (RLS + permissões).
 */

import {
  Bot,
  Building2,
  ChefHat,
  LayoutDashboard,
  MapPin,
  MessagesSquare,
  Package,
  ShoppingBag,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AppModule } from "@/lib/supabase/database.types";

export interface AppNavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
  /** Módulo exigido; ausente = sempre visível (núcleo). */
  readonly module?: AppModule;
  readonly mobilePrimary: boolean;
}

const ALL_ITEMS: readonly AppNavItem[] = [
  { href: "/app", label: "Visão geral", icon: LayoutDashboard, mobilePrimary: true },
  { href: "/app/atendimento", label: "Atendimento", icon: MessagesSquare, module: "conversations", mobilePrimary: true },
  { href: "/app/pedidos", label: "Pedidos", icon: ShoppingBag, module: "orders", mobilePrimary: true },
  { href: "/app/fila", label: "Fila de preparo", icon: ChefHat, module: "preparation_queue", mobilePrimary: false },
  { href: "/app/produtos", label: "Produtos", icon: Package, module: "catalog", mobilePrimary: false },
  { href: "/app/entrega", label: "Entrega", icon: MapPin, module: "delivery", mobilePrimary: false },
  { href: "/app/clientes", label: "Clientes", icon: Users, module: "customers", mobilePrimary: false },
  { href: "/app/configuracoes/ia", label: "Configuração da IA", icon: Bot, module: "agent_configuration", mobilePrimary: false },
  { href: "/app/configuracoes/empresa", label: "Empresa", icon: Building2, mobilePrimary: false },
  { href: "/app/configuracoes/unidades", label: "Unidades", icon: Store, mobilePrimary: false },
];

/** Itens de navegação visíveis para o conjunto de módulos habilitados. */
export function navItemsForModules(
  enabledModules: readonly AppModule[],
): readonly AppNavItem[] {
  return ALL_ITEMS.filter(
    (item) => item.module === undefined || enabledModules.includes(item.module),
  );
}
