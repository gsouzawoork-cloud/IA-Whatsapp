import Link from "next/link";
import { Compass } from "lucide-react";

/** Estado de "não encontrado" coerente dentro do painel. */
export default function AppNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-white/[0.03]">
        <Compass className="h-6 w-6 text-low" aria-hidden />
      </span>
      <h1 className="t-page-title text-lg">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-low">
        Esta rota do painel não existe na demonstração. Volte para a visão geral.
      </p>
      <Link
        href="/app"
        className="mt-1 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-[#06231a] transition-colors hover:bg-accent-hi"
      >
        Ir para a visão geral
      </Link>
    </div>
  );
}
