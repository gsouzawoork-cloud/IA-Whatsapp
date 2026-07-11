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
  neutral: "border-neutral-700 bg-neutral-800/60 text-neutral-300",
  accent: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  danger: "border-red-500/40 bg-red-500/10 text-red-300",
  info: "border-sky-500/40 bg-sky-500/10 text-sky-300",
};

/** Selo compacto com tom semântico. Não depende apenas da cor: sempre traz texto. */
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
