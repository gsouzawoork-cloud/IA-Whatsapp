"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationContext } from "@/core/context/current";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseDeliveryRepository } from "@/core/data/supabase/delivery";
import { canManageDelivery } from "@/core/auth/authorize";
import { recordAuditEvent } from "@/core/audit/record";
import { createZoneSchema } from "@/core/validation/business";

export interface FormState {
  readonly error?: string;
  readonly ok?: boolean;
}

/** Cria uma zona de entrega real (owner/admin/manager). Auditado. */
export async function createZoneAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const ctx = await requireOrganizationContext();
  if (!canManageDelivery({ role: ctx.role, status: ctx.status })) {
    return { error: "Você não tem permissão para gerenciar a entrega." };
  }

  const parsed = createZoneSchema.safeParse({
    name: formData.get("name"),
    neighborhoods: formData.get("neighborhoods") ?? "",
    deliveryFeeCents: formData.get("fee") ?? "0",
    minimumOrderCents: formData.get("minimum") ?? "0",
    estimatedMinMinutes: formData.get("etaMin") ?? "0",
    estimatedMaxMinutes: formData.get("etaMax") ?? "0",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  if (parsed.data.estimatedMaxMinutes < parsed.data.estimatedMinMinutes) {
    return { error: "O prazo máximo não pode ser menor que o mínimo." };
  }

  const supabase = await createSupabaseServerClient();
  const repo = createSupabaseDeliveryRepository(supabase, ctx.organizationId, ctx.unitId);
  try {
    const zone = await repo.createZone(parsed.data);
    await recordAuditEvent(supabase, {
      organizationId: ctx.organizationId,
      unitId: ctx.unitId,
      actorUserId: ctx.userId,
      action: "delivery_zone.created",
      entityType: "delivery_zone",
      entityId: zone.id,
      metadata: { name: zone.name, feeCents: zone.deliveryFeeCents },
    });
  } catch {
    return { error: "Não foi possível criar a zona de entrega." };
  }
  revalidatePath("/app/entrega");
  return { ok: true };
}

/** Ativa/desativa uma zona de entrega. */
export async function toggleZoneActive(formData: FormData): Promise<void> {
  const ctx = await requireOrganizationContext();
  if (!canManageDelivery({ role: ctx.role, status: ctx.status })) {
    return;
  }
  const id = String(formData.get("id") ?? "");
  const nextActive = String(formData.get("nextActive")) === "true";
  if (!id) return;

  const supabase = await createSupabaseServerClient();
  const repo = createSupabaseDeliveryRepository(supabase, ctx.organizationId, ctx.unitId);
  await repo.setZoneActive(id, nextActive);
  await recordAuditEvent(supabase, {
    organizationId: ctx.organizationId,
    unitId: ctx.unitId,
    actorUserId: ctx.userId,
    action: nextActive ? "delivery_zone.activated" : "delivery_zone.deactivated",
    entityType: "delivery_zone",
    entityId: id,
  });
  revalidatePath("/app/entrega");
}
