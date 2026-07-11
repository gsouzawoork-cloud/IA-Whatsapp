"use client";

import { Search } from "lucide-react";

/** Campo de busca acessível com ícone e label associada. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-neutral-800 bg-neutral-900 py-2 pl-9 pr-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
      />
    </label>
  );
}
