"use client";

import { useDemo } from "@/modules/demo/state/DemoProvider";
import { DemoBanner } from "./DemoBanner";

/** Topbar operacional: identidade no celular e indicação de ambiente simulado. */
export function Topbar() {
  const { state } = useDemo();
  const business = state.data.business;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500 text-xs font-bold text-neutral-950">
          {business.monogram}
        </span>
        <span className="truncate text-sm font-semibold text-neutral-100">
          {business.name}
        </span>
      </div>
      <p className="hidden text-xs text-neutral-500 lg:block">
        Ambiente simulado — dados fictícios, sem integrações reais.
      </p>
      <div className="lg:hidden">
        <DemoBanner compact />
      </div>
    </header>
  );
}
