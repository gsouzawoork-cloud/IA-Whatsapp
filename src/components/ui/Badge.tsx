import type { ReactNode } from "react";

/** Tom semântico de um selo. */
export type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

const TONE_CLASSES: Readonly<Record<BadgeTone, string>> = {
  neutral: "border-line bg-white/[0.04] text-mid",
  accent: "border-accent/30 bg-accent-soft text-accent",
  success: "border-ok/30 bg-ok/10 text-ok",
  warning: "border-warn/30 bg-warn/10 text-warn",
  danger: "border-bad/30 bg-bad/10 text-bad",
  info: "border-info/30 bg-info/10 text-info",
};

const DOT_CLASSES: Readonly<Record<BadgeTone, string>> = {
  neutral: "bg-low",
  accent: "bg-accent",
  success: "bg-ok",
  warning: "bg-warn",
  danger: "bg-bad",
  info: "bg-info",
};

/**
 * Selo compacto com tom semântico. Um ponto colorido acompanha o texto para não
 * depender apenas da cor (acessibilidade).
 */
export function Badge({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {dot ? (
        <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[tone]}`} aria-hidden />
      ) : null}
      {children}
    </span>
  );
}
