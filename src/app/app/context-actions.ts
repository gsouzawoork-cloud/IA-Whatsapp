"use server";

/**
 * Ações para trocar a organização/unidade ATIVA (preferência de seleção).
 *
 * Importante: o cookie apenas indica a SELEÇÃO entre opções às quais o usuário
 * já tem acesso. Ele NUNCA autoriza — a resolução server-side valida a
 * membership e a RLS é a barreira final. Um cookie inválido simplesmente cai no
 * padrão (primeira organização/unidade acessível).
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ORG_CONTEXT_COOKIES } from "@/core/context/organization";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function setActiveOrganization(formData: FormData): Promise<void> {
  const orgId = String(formData.get("organizationId") ?? "");
  if (orgId) {
    const store = await cookies();
    store.set(ORG_CONTEXT_COOKIES.org, orgId, COOKIE_OPTIONS);
    // Ao trocar de organização, a unidade anterior deixa de valer.
    store.delete(ORG_CONTEXT_COOKIES.unit);
  }
  redirect("/app");
}

export async function setActiveUnit(formData: FormData): Promise<void> {
  const unitId = String(formData.get("unitId") ?? "");
  if (unitId) {
    const store = await cookies();
    store.set(ORG_CONTEXT_COOKIES.unit, unitId, COOKIE_OPTIONS);
  }
  redirect("/app");
}
