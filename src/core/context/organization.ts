/**
 * Resolução server-side do contexto de organização/unidade ativos.
 *
 * Regra de segurança central: a organização e a unidade ativas são SEMPRE
 * derivadas das memberships do usuário autenticado e validadas no servidor —
 * nunca confiamos em `localStorage`/cookie de preferência para autorizar. O
 * cookie apenas indica a SELEÇÃO entre opções às quais o usuário já tem acesso;
 * a RLS do banco é a barreira final.
 */

import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppModule, AppRole, MembershipStatus } from "@/lib/supabase/database.types";

const ACTIVE_ORG_COOKIE = "central_ia_active_org";
const ACTIVE_UNIT_COOKIE = "central_ia_active_unit";

/** Organização à qual o usuário pertence (opção selecionável). */
export interface OrgOption {
  readonly id: string;
  readonly displayName: string;
  readonly role: AppRole;
  readonly status: MembershipStatus;
  readonly onboardingStatus: "pending" | "in_progress" | "completed";
}

/** Unidade acessível dentro da organização ativa. */
export interface UnitOption {
  readonly id: string;
  readonly name: string;
}

/** Contexto resolvido e pronto para uso pelas rotas reais. */
export interface OrganizationContext {
  readonly userId: string;
  readonly userName: string;
  readonly organizationId: string;
  readonly organizationName: string;
  readonly role: AppRole;
  readonly status: MembershipStatus;
  readonly onboardingStatus: "pending" | "in_progress" | "completed";
  readonly unitId: string | null;
  readonly unitName: string | null;
  readonly enabledModules: readonly AppModule[];
  readonly organizations: readonly OrgOption[];
  readonly units: readonly UnitOption[];
}

/** Estados possíveis da resolução do contexto. */
export type OrgContextResult =
  | { readonly kind: "ok"; readonly context: OrganizationContext }
  | { readonly kind: "unauthenticated" }
  | { readonly kind: "no-organization" }
  | { readonly kind: "suspended" };

/**
 * Resolve o contexto do usuário autenticado. Deve ser chamado apenas quando o
 * Supabase está configurado (as rotas reais tratam o caso não-configurado
 * antes). Retorna um resultado discriminado para a rota decidir o redirect.
 */
export async function resolveOrganizationContext(): Promise<OrgContextResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { kind: "unauthenticated" };
  }

  // Memberships ativas do usuário (sob RLS). Evitamos embed de FK para não
  // depender de metadados de relacionamento nos tipos gerados à mão.
  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("organization_id, role, status")
    .eq("user_id", user.id);

  const active = (memberships ?? []).filter((m) => m.status === "active");
  if (active.length === 0) {
    // Pode ter vínculo apenas suspenso.
    const hasSuspended = (memberships ?? []).some((m) => m.status === "suspended");
    return hasSuspended ? { kind: "suspended" } : { kind: "no-organization" };
  }

  // Dados das organizações às quais o usuário pertence (RLS filtra por membership).
  const { data: orgsData } = await supabase
    .from("organizations")
    .select("id, display_name, onboarding_status")
    .in(
      "id",
      active.map((m) => m.organization_id),
    );
  const orgById = new Map(
    (orgsData ?? []).map((o) => [o.id, o] as const),
  );

  const options: OrgOption[] = active.map((m) => {
    const org = orgById.get(m.organization_id);
    return {
      id: m.organization_id,
      displayName: org?.display_name ?? "Empresa",
      role: m.role,
      status: m.status,
      onboardingStatus: org?.onboarding_status ?? "pending",
    };
  });

  const cookieStore = await cookies();
  const preferredOrg = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  // `options` tem ao menos um elemento (active.length > 0 verificado acima).
  const chosen = options.find((o) => o.id === preferredOrg) ?? options[0]!;

  // Unidades acessíveis na organização escolhida (RLS filtra por can_access_unit).
  const { data: unitsData } = await supabase
    .from("units")
    .select("id, name")
    .eq("organization_id", chosen.id)
    .order("created_at", { ascending: true });
  const units: UnitOption[] = (unitsData ?? []).map((u) => ({ id: u.id, name: u.name }));

  const preferredUnit = cookieStore.get(ACTIVE_UNIT_COOKIE)?.value;
  const activeUnit =
    units.find((u) => u.id === preferredUnit) ?? units[0] ?? null;

  // Módulos habilitados da organização escolhida.
  const { data: modulesData } = await supabase
    .from("organization_modules")
    .select("module, enabled")
    .eq("organization_id", chosen.id)
    .eq("enabled", true);
  const enabledModules = (modulesData ?? []).map((m) => m.module);

  // Nome de exibição: perfil, senão prefixo do e-mail.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const userName =
    (profile?.full_name && profile.full_name.trim().length > 0
      ? profile.full_name
      : user.email?.split("@")[0]) ?? "Usuário";

  return {
    kind: "ok",
    context: {
      userId: user.id,
      userName,
      organizationId: chosen.id,
      organizationName: chosen.displayName,
      role: chosen.role,
      status: chosen.status,
      onboardingStatus: chosen.onboardingStatus,
      unitId: activeUnit?.id ?? null,
      unitName: activeUnit?.name ?? null,
      enabledModules,
      organizations: options,
      units,
    },
  };
}

export const ORG_CONTEXT_COOKIES = {
  org: ACTIVE_ORG_COOKIE,
  unit: ACTIVE_UNIT_COOKIE,
} as const;
