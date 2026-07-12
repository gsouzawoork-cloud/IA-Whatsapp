import type { ReactNode } from "react";
import { Activity } from "lucide-react";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { navItemsForModules } from "@/core/navigation/app-nav";
import type { OrganizationContext } from "@/core/context/organization";
import { RealSidebar } from "./RealSidebar";
import { RealMobileNav } from "./RealMobileNav";
import { SignOutButton } from "./SignOutButton";

/**
 * App shell da aplicação REAL. Reutiliza a ambientação e a linguagem visual
 * aprovadas, mas alimenta a navegação a partir dos módulos habilitados e do
 * contexto autenticado (nunca de dados demo).
 */
export function RealAppShell({
  context,
  userLabel,
  children,
}: {
  context: OrganizationContext;
  userLabel: string;
  children: ReactNode;
}) {
  const items = navItemsForModules(context.enabledModules);

  return (
    <div className="relative flex h-dvh text-hi">
      <AmbientBackground />
      <RealSidebar
        items={items}
        organizations={context.organizations.map((o) => ({ id: o.id, displayName: o.displayName }))}
        activeOrgId={context.organizationId}
        units={context.units}
        activeUnitId={context.unitId}
        role={context.role}
        userLabel={userLabel}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-subtle bg-surface-1/60 px-4 backdrop-blur">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-b from-accent to-info text-[11px] font-extrabold text-[#052733]">
              {context.organizationName.slice(0, 2).toUpperCase()}
            </span>
            <span className="truncate text-sm font-bold text-hi">{context.organizationName}</span>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-white/[0.03] px-3 py-1.5 text-xs text-mid elev-low">
              <span className="pulse-dot h-2 w-2 rounded-full bg-accent" aria-hidden />
              <Activity className="h-3.5 w-3.5 text-accent" aria-hidden />
              {context.unitName ?? "Sem unidade"}
            </span>
          </div>
          <div className="lg:hidden">
            <SignOutButton />
          </div>
        </header>
        <main className="scroll-slim flex-1 overflow-y-auto p-4 pb-24 lg:p-6 lg:pb-6">
          {children}
        </main>
      </div>
      <RealMobileNav items={items} />
    </div>
  );
}
