"use client";

/** Uma opção de filtro, com contador opcional. */
export interface FilterOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly count?: number;
}

/** Abas de filtro acessíveis (botões reais), com item ativo destacado. */
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
      className="flex flex-wrap gap-1.5"
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
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
              active
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
            }`}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span
                className={`rounded-full px-1.5 text-[10px] ${
                  active ? "bg-emerald-500/20" : "bg-neutral-800"
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
