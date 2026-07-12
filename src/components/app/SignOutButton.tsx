import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";

/** Botão de logout (submete a Server Action de encerramento de sessão). */
export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-low transition-colors hover:bg-white/[0.04] hover:text-hi"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Sair
      </button>
    </form>
  );
}
