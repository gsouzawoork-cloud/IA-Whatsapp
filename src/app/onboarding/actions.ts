"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { recordAuditEvent } from "@/core/audit/record";

export interface OnboardingState {
  readonly error?: string;
}

const createOrgSchema = z.object({
  displayName: z.string().trim().min(1, "Informe o nome da empresa.").max(120),
  businessType: z.enum(["food_service", "retail", "services", "other"]),
});

/** Gera um slug simples e estável a partir do nome. */
function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || `empresa-${Date.now().toString(36)}`;
}

/**
 * Cria a organização de forma TRANSACIONAL via função do banco
 * (create_organization_with_owner): empresa + owner + unidade + módulos +
 * configurações + progresso do onboarding, tudo ou nada. O owner é sempre o
 * usuário autenticado (o cliente não escolhe).
 */
export async function createOrganizationAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase não configurado neste ambiente." };
  }

  const parsed = createOrgSchema.safeParse({
    displayName: formData.get("displayName"),
    businessType: formData.get("businessType"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase.rpc("create_organization_with_owner", {
    p_display_name: parsed.data.displayName,
    p_slug: slugify(parsed.data.displayName),
    p_business_type: parsed.data.businessType,
  });
  const created = data?.[0];
  if (error || !created) {
    return { error: "Não foi possível criar a empresa. Tente outro nome." };
  }
  await recordAuditEvent(supabase, {
    organizationId: created.organization_id,
    unitId: created.unit_id,
    actorUserId: user.id,
    action: "organization.created",
    entityType: "organization",
    entityId: created.organization_id,
    metadata: { businessType: parsed.data.businessType },
  });

  redirect("/onboarding");
}

/** Conclui o onboarding: marca a organização como configurada. */
export async function completeOnboardingAction(formData: FormData): Promise<void> {
  const organizationId = String(formData.get("organizationId") ?? "");
  if (!organizationId || !isSupabaseConfigured()) {
    redirect("/onboarding");
  }

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("organizations")
    .update({ onboarding_status: "completed" })
    .eq("id", organizationId);
  await supabase
    .from("onboarding_progress")
    .update({ current_step: "revisao", completed_at: new Date().toISOString() })
    .eq("organization_id", organizationId);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  await recordAuditEvent(supabase, {
    organizationId,
    actorUserId: user?.id ?? null,
    action: "onboarding.completed",
    entityType: "organization",
    entityId: organizationId,
  });

  redirect("/app");
}
