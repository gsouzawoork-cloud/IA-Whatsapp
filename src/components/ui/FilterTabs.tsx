"use client";

/** Uma opção de filtro, com contador opcional. */
export interface FilterOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly count?: number;
}

/** Abas de filtro acessíveis (botões reais), roláveis, com item ativo destacado. */
export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="scroll-slim flex gap-1.5 overflow-x-auto pb-0.5"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
              active
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-line text-low hover:border-strong hover:text-mid"
            }`}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span
                className={`num rounded-full px-1.5 text-[10px] ${
                  active ? "bg-accent/20 text-accent" : "bg-white/[0.06] text-low"
                }`}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
