"use server";

/**
 * Server Actions de autenticação.
 *
 * Usam SEMPRE o client de servidor (cookies de sessão). Nenhuma senha é
 * registrada em log. Mensagens de erro são genéricas em fluxos sensíveis para
 * não revelar se um e-mail existe. Se o Supabase não estiver configurado, as
 * ações retornam um estado de erro claro (sem quebrar a aplicação).
 */

import { redirect } from "next/navigation";
import { isSupabaseConfigured, getAppUrl } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/core/validation/auth";

/** Estado retornado pelas ações para exibição no formulário. */
export interface AuthActionState {
  readonly error?: string;
  readonly notice?: string;
}

const NOT_CONFIGURED: AuthActionState = {
  error:
    "Autenticação indisponível: o Supabase ainda não está configurado neste ambiente.",
};

function firstIssue(messages: string[]): string {
  return messages[0] ?? "Dados inválidos.";
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error.issues.map((i) => i.message)) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Mensagem genérica: não confirma se o e-mail existe.
    return { error: "Credenciais inválidas. Verifique e tente novamente." };
  }
  redirect("/app");
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms") === "on",
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error.issues.map((i) => i.message)) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${getAppUrl()}/auth/confirmacao`,
    },
  });
  if (error) {
    return { error: "Não foi possível concluir o cadastro. Tente novamente." };
  }
  return {
    notice:
      "Cadastro recebido. Se a confirmação por e-mail estiver ativa, verifique sua caixa de entrada; caso contrário, você já pode entrar.",
  };
}

export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error.issues.map((i) => i.message)) };
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getAppUrl()}/auth/redefinir-senha`,
  });
  // Resposta idêntica exista ou não o e-mail (não vaza existência de conta).
  return {
    notice:
      "Se houver uma conta com esse e-mail, enviaremos instruções para redefinir a senha.",
  };
}

export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error.issues.map((i) => i.message)) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: "Não foi possível redefinir a senha. O link pode ter expirado." };
  }
  redirect("/app");
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/auth/login");
}
