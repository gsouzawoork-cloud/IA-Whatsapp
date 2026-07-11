import { FlaskConical } from "lucide-react";

/** Identificação discreta de ambiente demonstrativo. */
export function DemoBanner({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300"
      title="Ambiente de demonstração com dados simulados"
    >
      <FlaskConical className="h-3.5 w-3.5" aria-hidden />
      {compact ? "Demo" : "Demonstração"}
    </span>
  );
}
