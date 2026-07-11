"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";
import { NAV_ITEMS } from "@/modules/demo/navigation";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { DemoBanner } from "./DemoBanner";
import { PlatformBrand } from "./PlatformBrand";

/** Ativo quando a rota corresponde (evita marcar "/app" em subrotas). */
function isActive(pathname: string, href: string): boolean {
  if (href === "/app") {
    return pathname === "/app";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Sidebar do desktop: identidade da plataforma, empresa ativa e navegação. */
export function Sidebar() {
  const pathname = usePathname();
  const { state } = useDemo();
  const business = state.data.business;
  const attention = state.data.conversations.filter(
    (c) => c.status === "new" || c.status === "waiting_human",
  ).length;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-subtle bg-surface-1/80 backdrop-blur lg:flex">
      <div className="px-4 py-4">
        <PlatformBrand />
      </div>

      {/* Cápsula da empresa conectada (identidade distinta da plataforma). */}
      <div className="px-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white/[0.03] px-3 py-2.5 elev-low">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-accent to-emerald-600 text-xs font-extrabold text-[#06231a] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
            {business.monogram}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-hi">{business.name}</p>
            <p className="truncate text-[11px] text-low">{business.unit.name}</p>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-dim" aria-hidden />
        </div>
      </div>

      <nav
        className="scroll-slim mt-4 flex-1 space-y-0.5 overflow-y-auto px-3"
        aria-label="Navegação principal"
      >
        <p className="t-eyebrow px-2 pb-1.5 text-[10px] uppercase">Operação</p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          const showAttention = item.href === "/app/atendimento" && attention > 0;
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
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_rgba(126,224,181,0.8)]"
                  aria-hidden
                />
              ) : null}
              <Icon
                className={`h-4 w-4 shrink-0 ${active ? "text-accent" : "text-low group-hover:text-mid"}`}
                aria-hidden
              />
              <span className="flex-1">{item.label}</span>
              {showAttention ? (
                <span
                  className="num rounded-full bg-bad/20 px-1.5 text-[10px] font-bold text-bad"
                  aria-label={`${attention} conversas precisam de atenção`}
                >
                  {attention}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-subtle p-3">
        <DemoBanner />
        <div className="flex items-center gap-2.5 rounded-lg px-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/[0.04] text-[11px] font-bold text-mid">
            OP
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-mid">Operador</p>
            <p className="truncate text-[11px] text-dim">Atendimento · Demo</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
