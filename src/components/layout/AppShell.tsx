import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { AmbientBackground } from "./AmbientBackground";

/**
 * App shell da plataforma: fundo ambiental vivo, sidebar no desktop, navegação
 * inferior no celular e topbar operacional.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-dvh text-hi">
      <AmbientBackground />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="scroll-slim flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
