import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

/** Cabeçalho institucional com acesso à aplicação real (login/cadastro). */
export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="text-sm font-semibold tracking-tight">
          {siteConfig.name}
        </span>
        <nav className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Entrar
          </Link>
          <Link
            href="/auth/cadastro"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Criar conta
          </Link>
        </nav>
      </div>
    </header>
  );
}
