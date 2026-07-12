"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "../actions";
import { Field, FormAlert, FormShell } from "@/components/auth/FormShell";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initial: AuthActionState = {};

export default function CadastroPage() {
  const [state, formAction] = useActionState(signUpAction, initial);

  return (
    <FormShell
      title="Criar conta"
      subtitle="Comece a configurar a central da sua empresa."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/auth/login" className="font-semibold text-accent hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form action={formAction}>
        <FormAlert error={state.error} notice={state.notice} />
        <Field label="Nome completo" name="fullName" autoComplete="name" />
        <Field label="E-mail" name="email" type="email" autoComplete="email" />
        <Field label="Senha" name="password" type="password" autoComplete="new-password" placeholder="Mínimo de 8 caracteres" />
        <Field label="Confirmar senha" name="confirmPassword" type="password" autoComplete="new-password" />
        <label className="mb-4 flex items-start gap-2 text-xs text-mid">
          <input type="checkbox" name="acceptTerms" className="mt-0.5 accent-[color:var(--accent,#4ec5e0)]" />
          <span>Li e aceito os termos de uso e a política de privacidade.</span>
        </label>
        <SubmitButton label="Criar conta" />
      </form>
    </FormShell>
  );
}
