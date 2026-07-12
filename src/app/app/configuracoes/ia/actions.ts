"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationContext } from "@/core/context/current";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAgentRepository } from "@/core/data/supabase/agent";
import { canManageAgent } from "@/core/auth/authorize";
import { recordAuditEvent } from "@/core/audit/record";
import { agentSettingsSchema } from "@/core/validation/business";

export interface FormState {
  readonly error?: string;
  readonly ok?: boolean;
}

const bool = (formData: FormData, key: string) => formData.get(key) === "on";

/** Persiste a configuração do agente (owner/admin). Auditado. */
export async function saveAgentSettingsAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const ctx = await requireOrganizationContext();
  if (!canManageAgent({ role: ctx.role, status: ctx.status })) {
    return { error: "Você não tem permissão para configurar a IA." };
  }

  const parsed = agentSettingsSchema.safeParse({
    agentName: formData.get("agentName"),
    introductionMessage: formData.get("introductionMessage") ?? "",
    tone: formData.get("tone") ?? "friendly",
    formalityLevel: formData.get("formalityLevel") ?? "2",
    emojiUsage: formData.get("emojiUsage") ?? "moderate",
    automaticServiceEnabled: bool(formData, "automaticServiceEnabled"),
    humanHandoffEnabled: bool(formData, "humanHandoffEnabled"),
    canSearchCatalog: bool(formData, "canSearchCatalog"),
    canCheckAvailability: bool(formData, "canCheckAvailability"),
    canQuoteDelivery: bool(formData, "canQuoteDelivery"),
    canCreateOrderDraft: bool(formData, "canCreateOrderDraft"),
    canInformOrderStatus: bool(formData, "canInformOrderStatus"),
    canSuggestAlternatives: bool(formData, "canSuggestAlternatives"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createSupabaseServerClient();
  const repo = createSupabaseAgentRepository(supabase, ctx.organizationId);
  try {
    await repo.updateSettings(parsed.data);
    await recordAuditEvent(supabase, {
      organizationId: ctx.organizationId,
      actorUserId: ctx.userId,
      action: "agent_settings.updated",
      entityType: "agent_settings",
      metadata: { agentName: parsed.data.agentName },
    });
  } catch {
    return { error: "Não foi possível salvar a configuração." };
  }
  revalidatePath("/app/configuracoes/ia");
  return { ok: true };
}
