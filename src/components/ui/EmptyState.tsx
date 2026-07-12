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
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/[0.03]">
        <Icon className="h-5 w-5 text-low" aria-hidden />
      </span>
      <p className="text-sm font-semibold text-hi">{title}</p>
      {description ? (
        <p className="max-w-xs text-xs leading-relaxed text-low">{description}</p>
      ) : null}
      {action ? <div className="mt-1.5">{action}</div> : null}
    </div>
  );
}
