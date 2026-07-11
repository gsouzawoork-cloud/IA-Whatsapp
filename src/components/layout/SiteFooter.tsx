import { siteConfig } from "@/lib/site-config";

/** Rodapé institucional simples. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-neutral-500 dark:text-neutral-400">
        <p>
          {siteConfig.name} · {year}. Projeto em fundação. Integrações com
          WhatsApp, IA e pagamentos ainda não estão implementadas.
        </p>
      </div>
    </footer>
  );
}
