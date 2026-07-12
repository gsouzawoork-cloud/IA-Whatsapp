import Link from "next/link";
import { ShieldAlert } from "lucide-react";

/** Estado de acesso negado/suspenso, com linguagem visual da plataforma. */
export function AccessDenied({
  title = "Acesso negado",
  description = "Você não tem permissão para acessar esta área.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-bad/40 bg-bad/10 text-bad">
        <ShieldAlert className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="mt-4 text-xl font-bold text-hi">{title}</h1>
      <p className="mt-2 text-sm text-mid">{description}</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-strong px-4 py-2 text-sm font-semibold text-hi hover:bg-white/[0.06]"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
