import type { ReactNode } from "react";

/** Cabeçalho de página com título forte, descrição e ações à direita. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="t-eyebrow mb-1 text-[11px] uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="t-page-title text-[1.375rem]">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-mid">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
