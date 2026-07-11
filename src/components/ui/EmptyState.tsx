import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Estado vazio consistente para listas e painéis sem conteúdo. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-800 px-6 py-10 text-center">
      <Icon className="h-6 w-6 text-neutral-500" aria-hidden />
      <p className="text-sm font-medium text-neutral-200">{title}</p>
      {description ? (
        <p className="max-w-xs text-xs text-neutral-500">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
