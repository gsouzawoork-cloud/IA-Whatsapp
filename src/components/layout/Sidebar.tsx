"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/modules/demo/navigation";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { DemoBanner } from "./DemoBanner";

/** Um item ativo quando a rota corresponde exatamente (evita marcar "/app" em subrotas). */
function isActive(pathname: string, href: string): boolean {
  if (href === "/app") {
    return pathname === "/app";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Sidebar do desktop: identidade, navegação e perfil do operador. */
export function Sidebar() {
  const pathname = usePathname();
  const { state } = useDemo();
  const business = state.data.business;
  const attention = state.data.conversations.filter(
    (c) => c.status === "new" || c.status === "waiting_human",
  ).length;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 lg:flex">
      <div className="flex items-center gap-2.5 border-b border-neutral-800 px-4 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500 text-sm font-bold text-neutral-950">
          {business.monogram}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-100">
            {business.name}
          </p>
          <p className="truncate text-xs text-neutral-500">{business.unit.name}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          const showAttention = item.href === "/app/atendimento" && attention > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
                active
                  ? "bg-neutral-800/80 font-medium text-neutral-100"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {showAttention ? (
                <span
                  className="rounded-full bg-red-500/20 px-1.5 text-[10px] font-semibold text-red-300"
                  aria-label={`${attention} conversas precisam de atenção`}
                >
                  {attention}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-neutral-800 p-4">
        <DemoBanner />
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-neutral-300">
            OP
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-neutral-200">Operador</p>
            <p className="truncate text-[11px] text-neutral-500">Atendimento · Demo</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
