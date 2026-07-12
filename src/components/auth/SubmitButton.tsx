"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/** Botão de envio com estado de carregamento (via useFormStatus). */
export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-[#052733] transition-[transform,background-color] duration-150 hover:bg-accent-hi disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {pending ? "Processando…" : label}
    </button>
  );
}
