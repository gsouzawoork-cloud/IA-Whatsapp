import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";

/**
 * App shell da plataforma: sidebar no desktop, navegação inferior no celular e
 * topbar operacional. O conteúdo recebe padding inferior no celular para não
 * ficar sob a barra de navegação.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh bg-neutral-950 text-neutral-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
