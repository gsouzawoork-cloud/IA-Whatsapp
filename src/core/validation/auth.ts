/**
 * Schemas de validação de autenticação (Zod).
 *
 * Regras: e-mail normalizado, senha com tamanho mínimo, campos desconhecidos
 * descartados. Reutilizados por Server Actions e formulários.
 */

import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("E-mail inválido.");

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter ao menos 8 caracteres.")
  .max(72, "A senha é muito longa.");

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, "Informe seu nome.").max(120),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().optional(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha."),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
