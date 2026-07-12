import type { ReactNode } from "react";
import Link from "next/link";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PlatformBrand } from "@/components/layout/PlatformBrand";

/**
 * Layout das telas de autenticação: mesma ambientação tecnológica da
 * plataforma, cartão central e retorno para a página inicial. Público.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col text-hi">
      <AmbientBackground />
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" aria-label="Central IA — início">
          <PlatformBrand />
        </Link>
        <Link
          href="/demo"
          className="rounded-lg border border-strong px-3 py-1.5 text-xs font-semibold text-mid hover:bg-white/[0.06] hover:text-hi"
        >
          Ver demonstração
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
