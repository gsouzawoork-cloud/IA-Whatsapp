"use client";

import Link from "next/link";
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
import { usePathname } from "next/navigation";
import type { NavigationIconKey, NavigationItem } from "@/core/navigation/app-nav";
import { ROLE_LABELS } from "@/core/auth/roles";
import type { Role } from "@/core/auth/roles";
import { PlatformBrand } from "@/components/layout/PlatformBrand";
import { OrgSwitcher } from "./OrgSwitcher";
import { SignOutButton } from "./SignOutButton";

const ICONS: Record<NavigationIconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  messages: MessagesSquare,
  orders: ShoppingBag,
  queue: ChefHat,
  products: Package,
  delivery: MapPin,
  customers: Users,
  agent: Bot,
  company: Building2,
  units: Store,
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/app") {
    return pathname === "/app";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface Props {
  items: readonly NavigationItem[];
  organizations: readonly { id: string; displayName: string }[];
  activeOrgId: string;
  units: readonly { id: string; name: string }[];
  activeUnitId: string | null;
  role: Role;
  userLabel: string;
}

/** Sidebar da aplicação real: identidade, seletor de empresa/unidade, navegação. */
export function RealSidebar(props: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-subtle bg-surface-1/80 backdrop-blur lg:flex">
      <div className="px-4 py-4">
        <PlatformBrand />
      </div>

      <div className="px-3">
        <OrgSwitcher
          organizations={props.organizations}
          activeOrgId={props.activeOrgId}
          units={props.units}
          activeUnitId={props.activeUnitId}
        />
      </div>

      <nav className="scroll-slim mt-4 flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="Navegação principal">
        <p className="t-eyebrow px-2 pb-1.5 text-[10px] uppercase">Operação</p>
        {props.items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = ICONS[item.iconKey];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-2.5 rounded-lg py-2 pl-3 pr-2 text-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                active
                  ? "bg-white/[0.05] font-semibold text-hi elev-low"
                  : "font-medium text-low hover:translate-x-0.5 hover:bg-white/[0.03] hover:text-mid"
              }`}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_rgba(78,197,224,0.8)]" aria-hidden />
              ) : null}
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-accent" : "text-low group-hover:text-mid"}`} aria-hidden />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-subtle p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/[0.04] text-[11px] font-bold text-mid">
            {props.userLabel.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-mid">{props.userLabel}</p>
            <p className="truncate text-[11px] text-dim">{ROLE_LABELS[props.role]}</p>
          </div>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
