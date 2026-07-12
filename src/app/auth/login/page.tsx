"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type AuthActionState } from "../actions";
import { Field, FormAlert, FormShell } from "@/components/auth/FormShell";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initial: AuthActionState = {};

export default function LoginPage() {
  const [state, formAction] = useActionState(signInAction, initial);

  return (
    <FormShell
      title="Entrar"
      subtitle="Acesse a central da sua empresa."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/auth/cadastro" className="font-semibold text-accent hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form action={formAction}>
        <FormAlert error={state.error} notice={state.notice} />
        <Field label="E-mail" name="email" type="email" autoComplete="email" />
        <Field label="Senha" name="password" type="password" autoComplete="current-password" />
        <div className="mb-4 text-right">
          <Link href="/auth/esqueci-senha" className="text-xs text-mid hover:text-hi hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <SubmitButton label="Entrar" />
      </form>
    </FormShell>
  );
}
