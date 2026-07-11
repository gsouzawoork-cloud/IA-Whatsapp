import type { LucideIcon } from "lucide-react";

/** Cartão de indicador operacional (valor derivado dos dados, nunca digitado). */
export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-neutral-800 bg-neutral-900/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-400">{label}</span>
        <Icon
          className={`h-4 w-4 ${highlight ? "text-amber-400" : "text-neutral-500"}`}
          aria-hidden
        />
      </div>
      <p className="mt-2 text-2xl font-semibold text-neutral-100">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
