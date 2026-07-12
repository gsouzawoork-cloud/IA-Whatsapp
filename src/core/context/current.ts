import { cache } from "react";
import { redirect } from "next/navigation";
import {
  resolveOrganizationContext,
  type OrganizationContext,
  type OrgContextResult,
} from "./organization";

/**
 * Resolução do contexto memoizada por request (React `cache`): várias páginas do
 * mesmo request compartilham o resultado sem reconsultar o banco.
 */
export const getOrganizationContextCached = cache(
  async (): Promise<OrgContextResult> => resolveOrganizationContext(),
);

/**
 * Retorna o contexto pronto (kind "ok") ou redireciona conforme o estado. Usado
 * pelas páginas reais, que já rodam sob o layout protegido — aqui apenas
 * garantimos o tipo estreito e um fallback seguro.
 */
export async function requireOrganizationContext(): Promise<OrganizationContext> {
  const result = await getOrganizationContextCached();
  if (result.kind === "ok") {
    return result.context;
  }
  if (result.kind === "no-organization") {
    redirect("/onboarding");
  }
  redirect("/auth/login");
}
