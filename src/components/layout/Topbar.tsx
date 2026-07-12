"use client";

import Link from "next/link";
import { Activity, MessagesSquare } from "lucide-react";
import { useDemo } from "@/modules/demo/state/DemoProvider";
import { DemoBanner } from "./DemoBanner";

/** Topbar operacional: pulso da operação, ambiente demo e acesso rápido. */
export function Topbar() {
  const { state } = useDemo();
  const business = state.data.business;
  const attention = state.data.conversations.filter(
    (c) => c.status === "new" || c.status === "waiting_human",
  ).length;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-subtle bg-surface-1/60 px-4 backdrop-blur">
      {/* Celular: identidade da empresa. */}
      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-b from-accent to-info text-[11px] font-extrabold text-[#052733]">
          {business.monogram}
        </span>
        <span className="truncate text-sm font-bold text-hi">{business.name}</span>
      </div>

      {/* Desktop: pulso da operação. */}
      <div className="hidden items-center gap-2 lg:flex">
        <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-white/[0.03] px-3 py-1.5 text-xs text-mid elev-low">
          <span className="pulse-dot h-2 w-2 rounded-full bg-accent" aria-hidden />
          <Activity className="h-3.5 w-3.5 text-accent" aria-hidden />
          Monitoramento ativo
          <span className="mx-1 h-3 w-px bg-strong" aria-hidden />
          <span className="num font-semibold text-hi">{attention}</span>
          <span className="text-low">precisam de atenção</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/demo/atendimento"
          className="inline-flex items-center gap-1.5 rounded-lg border border-strong bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-hi transition-colors hover:bg-white/[0.08]"
        >
          <MessagesSquare className="h-3.5 w-3.5 text-accent" aria-hidden />
          <span className="hidden sm:inline">Atendimento</span>
        </Link>
        <div className="hidden lg:block">
          <DemoBanner compact />
        </div>
        <div className="lg:hidden">
          <DemoBanner compact />
        </div>
      </div>
    </header>
  );
}
