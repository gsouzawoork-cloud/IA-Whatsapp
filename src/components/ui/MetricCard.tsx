import type { LucideIcon } from "lucide-react";

/** Ênfase visual do indicador. */
export type MetricTone = "neutral" | "accent" | "info" | "attention";

const TONE: Readonly<
  Record<MetricTone, { icon: string; glow: string; value: string }>
> = {
  neutral: {
    icon: "border-line bg-white/[0.04] text-mid",
    glow: "",
    value: "text-hi",
  },
  accent: {
    icon: "border-accent/30 bg-accent-soft text-accent",
    glow: "before:bg-accent/[0.07]",
    value: "text-hi",
  },
  info: {
    icon: "border-info/30 bg-info/10 text-info",
    glow: "before:bg-info/[0.06]",
    value: "text-hi",
  },
  attention: {
    icon: "border-warn/30 bg-warn/10 text-warn",
    glow: "before:bg-warn/[0.07]",
    value: "text-hi",
  },
};

/**
 * Cartão de indicador: número dominante, ícone em superfície própria e contexto
 * derivado. `highlight` eleva o card (Nível 3); `tone` adiciona luz contextual.
 */
export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  highlight = false,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  tone?: MetricTone;
  highlight?: boolean;
}) {
  const styles = TONE[tone];
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 ${
        highlight ? "panel-priority" : "panel elev-low"
      } before:pointer-events-none before:absolute before:-right-6 before:-top-8 before:h-24 before:w-24 before:rounded-full before:blur-2xl before:content-[''] ${styles.glow}`}
    >
      <div className="relative flex items-start justify-between gap-2">
        <p className="t-eyebrow text-[11px] uppercase leading-tight">{label}</p>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${styles.icon}`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className={`t-kpi relative mt-3 text-3xl ${styles.value}`}>{value}</p>
      {hint ? <p className="relative mt-1.5 text-xs text-low">{hint}</p> : null}
    </div>
  );
}
