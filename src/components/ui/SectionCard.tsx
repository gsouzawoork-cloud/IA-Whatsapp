import type { ReactNode } from "react";

/** Bloco de conteúdo com título opcional e superfície de contraste moderado. */
export function SectionCard({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-neutral-800 bg-neutral-900/40 ${className}`}
    >
      {title || action ? (
        <header className="flex items-center justify-between gap-2 border-b border-neutral-800 px-4 py-3">
          {title ? (
            <h2 className="text-sm font-semibold text-neutral-200">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </header>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}
