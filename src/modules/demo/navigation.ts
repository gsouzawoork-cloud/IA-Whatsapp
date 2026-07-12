import {
  Bot,
  ChefHat,
  LayoutDashboard,
  MessagesSquare,
  Pizza,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { OptionalModuleKey } from "@/core/modules";

/** Item de navegação do painel. */
export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
  /** Módulo opcional exigido; ausente = núcleo (sempre visível). */
  readonly module?: OptionalModuleKey;
  /** Aparece na navegação inferior do celular. */
  readonly mobilePrimary: boolean;
}

/**
 * Navegação da demonstração da pizzaria. Reflete apenas os módulos ativos: itens
 * de módulos desativados não seriam incluídos aqui (ver `DEMO_ENABLED_MODULES`).
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/demo", label: "Visão geral", icon: LayoutDashboard, mobilePrimary: true },
  {
    href: "/demo/atendimento",
    label: "Atendimento",
    icon: MessagesSquare,
    mobilePrimary: true,
  },
  {
    href: "/demo/pedidos",
    label: "Pedidos",
    icon: ShoppingBag,
    module: "orders",
    mobilePrimary: true,
  },
  {
    href: "/demo/fila",
    label: "Fila de preparo",
    icon: ChefHat,
    module: "preparation",
    mobilePrimary: true,
  },
  {
    href: "/demo/produtos",
    label: "Produtos",
    icon: Pizza,
    module: "availability",
    mobilePrimary: false,
  },
  {
    href: "/demo/clientes",
    label: "Clientes",
    icon: Users,
    mobilePrimary: false,
  },
  {
    href: "/demo/configuracoes/ia",
    label: "Configuração da IA",
    icon: Bot,
    mobilePrimary: false,
  },
];

/** Módulos opcionais habilitados nesta demonstração de pizzaria. */
export const DEMO_ENABLED_MODULES: readonly OptionalModuleKey[] = [
  "orders",
  "catalog",
  "availability",
  "payments",
  "preparation",
  "delivery",
];
