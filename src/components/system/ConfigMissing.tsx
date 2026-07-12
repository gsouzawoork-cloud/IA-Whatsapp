import { Database, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Estado de "configuração ausente" para as rotas reais quando o Supabase não
 * está configurado. NUNCA mostra dados falsos: explica o que falta e aponta para
 * a demonstração (que é pública) e para a documentação de setup.
 */
export function ConfigMissing() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-white/[0.03] text-accent">
        <Database className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="mt-4 text-xl font-bold text-hi">Configuração pendente</h1>
      <p className="mt-2 text-sm leading-relaxed text-mid">
        A aplicação real precisa de um projeto Supabase configurado. Defina{" "}
        <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
        e{" "}
        <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{" "}
        no ambiente e reinicie. Consulte{" "}
        <span className="font-semibold text-hi">docs/SUPABASE_SETUP.md</span>.
      </p>
      <p className="mt-4 text-xs text-low">
        Enquanto isso, a demonstração continua disponível — sem banco, login ou
        integrações reais.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-[#052733] transition-colors hover:bg-accent-hi"
        >
          Abrir demonstração
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-strong px-4 py-2 text-sm font-semibold text-hi hover:bg-white/[0.06]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Início
        </Link>
      </div>
    </div>
  );
}
