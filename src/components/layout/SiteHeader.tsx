import { siteConfig } from "@/lib/site-config";

/** Cabeçalho institucional simples. Sem navegação funcional nesta fase. */
export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="text-sm font-semibold tracking-tight">
          {siteConfig.name}
        </span>
        <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
          {siteConfig.phase}
        </span>
      </div>
    </header>
  );
}
