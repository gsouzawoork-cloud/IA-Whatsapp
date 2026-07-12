"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthActionState } from "../actions";
import { Field, FormAlert, FormShell } from "@/components/auth/FormShell";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initial: AuthActionState = {};

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(resetPasswordAction, initial);

  return (
    <FormShell
      title="Definir nova senha"
      subtitle="Escolha uma nova senha para sua conta."
    >
      <form action={formAction}>
        <FormAlert error={state.error} notice={state.notice} />
        <Field label="Nova senha" name="password" type="password" autoComplete="new-password" placeholder="Mínimo de 8 caracteres" />
        <Field label="Confirmar nova senha" name="confirmPassword" type="password" autoComplete="new-password" />
        <SubmitButton label="Salvar nova senha" />
      </form>
    </FormShell>
  );
}
