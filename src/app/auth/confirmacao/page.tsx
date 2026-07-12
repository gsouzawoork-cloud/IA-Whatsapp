import Link from "next/link";
import { MailCheck } from "lucide-react";
import { FormShell } from "@/components/auth/FormShell";

/** Página informativa pós-cadastro/confirmação de e-mail. */
export default function ConfirmacaoPage() {
  return (
    <FormShell title="Confirmação">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
          <MailCheck className="h-5 w-5" aria-hidden />
        </span>
        <p className="mt-3 text-sm text-mid">
          Se a confirmação por e-mail estiver ativa, verifique sua caixa de
          entrada para ativar a conta. Depois, é só entrar.
        </p>
        <Link
          href="/auth/login"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-[#052733] hover:bg-accent-hi"
        >
          Ir para o login
        </Link>
      </div>
    </FormShell>
  );
}
