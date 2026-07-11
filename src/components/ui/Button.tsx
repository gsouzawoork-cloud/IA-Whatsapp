import type { ButtonHTMLAttributes, Ref } from "react";

/** Variante visual da ação. */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASSES: Readonly<Record<ButtonVariant, string>> = {
  primary:
    "bg-emerald-500 text-neutral-950 hover:bg-emerald-400 focus-visible:ring-emerald-400/60",
  secondary:
    "border border-neutral-700 bg-neutral-800/60 text-neutral-100 hover:bg-neutral-800 focus-visible:ring-neutral-500/60",
  ghost:
    "text-neutral-300 hover:bg-neutral-800/60 focus-visible:ring-neutral-500/60",
  danger:
    "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 focus-visible:ring-red-400/60",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  ref?: Ref<HTMLButtonElement>;
};

/** Botão real (elemento `<button>`) com variantes e foco visível. */
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
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40 ${sizeClasses} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
