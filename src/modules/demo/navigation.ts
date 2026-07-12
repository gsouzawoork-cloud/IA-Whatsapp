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
  { href: "/app", label: "Visão geral", icon: LayoutDashboard, mobilePrimary: true },
  {
    href: "/app/atendimento",
    label: "Atendimento",
    icon: MessagesSquare,
    mobilePrimary: true,
  },
  {
    href: "/app/pedidos",
    label: "Pedidos",
    icon: ShoppingBag,
    module: "orders",
    mobilePrimary: true,
  },
  {
    href: "/app/fila",
    label: "Fila de preparo",
    icon: ChefHat,
    module: "preparation",
    mobilePrimary: true,
  },
  {
    href: "/app/produtos",
    label: "Produtos",
    icon: Pizza,
    module: "availability",
    mobilePrimary: false,
  },
  {
    href: "/app/clientes",
    label: "Clientes",
    icon: Users,
    mobilePrimary: false,
  },
  {
    href: "/app/configuracoes/ia",
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
