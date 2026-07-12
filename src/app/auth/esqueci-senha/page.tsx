"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type AuthActionState } from "../actions";
import { Field, FormAlert, FormShell } from "@/components/auth/FormShell";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initial: AuthActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPasswordAction, initial);

  return (
    <FormShell
      title="Recuperar acesso"
      subtitle="Enviaremos um link para redefinir sua senha."
      footer={
        <Link href="/auth/login" className="font-semibold text-accent hover:underline">
          Voltar para entrar
        </Link>
      }
    >
      <form action={formAction}>
        <FormAlert error={state.error} notice={state.notice} />
        <Field label="E-mail" name="email" type="email" autoComplete="email" />
        <SubmitButton label="Enviar link" />
      </form>
    </FormShell>
  );
}
