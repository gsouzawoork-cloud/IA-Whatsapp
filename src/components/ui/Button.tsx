import type { ButtonHTMLAttributes, Ref } from "react";

/** Variante visual da ação. */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASSES: Readonly<Record<ButtonVariant, string>> = {
  primary:
    "bg-accent text-[#06231a] font-bold shadow-[0_6px_18px_-6px_rgba(61,220,151,0.55)] hover:bg-accent-hi hover:-translate-y-px active:translate-y-0 focus-visible:ring-accent/60",
  secondary:
    "border border-strong bg-white/[0.04] text-hi hover:bg-white/[0.08] hover:-translate-y-px active:translate-y-0 focus-visible:ring-white/30",
  ghost:
    "text-mid hover:bg-white/[0.06] hover:text-hi focus-visible:ring-white/30",
  danger:
    "border border-bad/40 bg-bad/10 text-bad hover:bg-bad/20 hover:-translate-y-px active:translate-y-0 focus-visible:ring-bad/50",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  ref?: Ref<HTMLButtonElement>;
};

/** Botão real (`<button>`) com variantes, elevação no hover e foco visível. */
export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  ref,
  ...props
}: ButtonProps) {
  const sizeClasses = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm";
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-[transform,background-color,box-shadow] duration-150 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 ${sizeClasses} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
