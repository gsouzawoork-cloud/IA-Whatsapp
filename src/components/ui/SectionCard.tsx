import type { ReactNode } from "react";

/** Painel elevado com cabeçalho opcional (Nível 2 de profundidade). */
export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "p-4",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`panel elev-low overflow-hidden ${className}`}>
      {title || action ? (
        <header className="flex items-center justify-between gap-2 border-b border-subtle px-4 py-3">
          <div>
            {title ? <h2 className="t-section text-sm">{title}</h2> : null}
            {description ? (
              <p className="mt-0.5 text-xs text-low">{description}</p>
            ) : null}
          </div>
          {action}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
