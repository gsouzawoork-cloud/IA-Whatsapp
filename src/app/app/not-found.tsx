import Link from "next/link";
import { Compass } from "lucide-react";

/** Estado de "não encontrado" coerente dentro do painel. */
export default function AppNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <Compass className="h-8 w-8 text-neutral-500" aria-hidden />
      <h1 className="text-lg font-semibold text-neutral-100">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-neutral-400">
        Esta rota do painel não existe na demonstração. Volte para a visão geral.
      </p>
      <Link
        href="/app"
        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-emerald-400"
      >
        Ir para a visão geral
      </Link>
    </div>
  );
}
