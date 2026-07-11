import { FlaskConical } from "lucide-react";

/** Identificação discreta de ambiente demonstrativo. */
export function DemoBanner({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-warn/25 bg-warn/10 px-2.5 py-1 text-xs font-semibold text-warn"
      title="Ambiente de demonstração com dados simulados"
    >
      <FlaskConical className="h-3.5 w-3.5" aria-hidden />
      {compact ? "Demo" : "Demonstração"}
    </span>
  );
}
