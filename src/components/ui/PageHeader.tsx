import type { ReactNode } from "react";

/** Cabeçalho de página com título, descrição opcional e ações à direita. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-800 pb-4">
      <div>
        <h1 className="text-lg font-semibold text-neutral-100">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-neutral-400">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
