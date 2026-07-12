import { Sparkles } from "lucide-react";

/**
 * Identidade da plataforma (SaaS), distinta da empresa conectada. Marca
 * tipográfica/geométrica simples criada com CSS + ícone existente.
 */
export function PlatformBrand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-gradient-to-b from-accent/25 to-accent/5 text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <Sparkles className="h-5 w-5" aria-hidden />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-extrabold tracking-tight text-hi">Central IA</p>
        <p className="text-[11px] text-low">Atendimento inteligente</p>
      </div>
    </div>
  );
}
