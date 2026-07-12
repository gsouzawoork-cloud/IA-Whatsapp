"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationContext } from "@/core/context/current";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseCatalogRepository } from "@/core/data/supabase/catalog";
import { canManageCatalog } from "@/core/auth/authorize";
import { recordAuditEvent } from "@/core/audit/record";
import { createProductSchema } from "@/core/validation/business";

export interface FormState {
  readonly error?: string;
  readonly ok?: boolean;
}

/** Cria um produto real (owner/admin/manager). Auditado. */
export async function createProductAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const ctx = await requireOrganizationContext();
  if (!canManageCatalog({ role: ctx.role, status: ctx.status })) {
    return { error: "Você não tem permissão para gerenciar o catálogo." };
  }

  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category") ?? "",
    priceCents: formData.get("price") ?? "0",
    availabilityMode: formData.get("availabilityMode") ?? "always_available",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createSupabaseServerClient();
  const repo = createSupabaseCatalogRepository(supabase, ctx.organizationId, ctx.unitId);
  try {
    const product = await repo.createProduct(parsed.data);
    await recordAuditEvent(supabase, {
      organizationId: ctx.organizationId,
      unitId: ctx.unitId,
      actorUserId: ctx.userId,
      action: "product.created",
      entityType: "product",
      entityId: product.id,
      metadata: { name: product.name, priceCents: product.priceCents },
    });
  } catch {
    return { error: "Não foi possível criar o produto." };
  }
  revalidatePath("/app/produtos");
  return { ok: true };
}

/** Ativa/desativa um produto (preferir desativação a exclusão destrutiva). */
export async function toggleProductActive(formData: FormData): Promise<void> {
  const ctx = await requireOrganizationContext();
  if (!canManageCatalog({ role: ctx.role, status: ctx.status })) {
    return;
  }
  const id = String(formData.get("id") ?? "");
  const nextActive = String(formData.get("nextActive")) === "true";
  if (!id) return;

  const supabase = await createSupabaseServerClient();
  const repo = createSupabaseCatalogRepository(supabase, ctx.organizationId, ctx.unitId);
  await repo.setProductActive(id, nextActive);
  await recordAuditEvent(supabase, {
    organizationId: ctx.organizationId,
    unitId: ctx.unitId,
    actorUserId: ctx.userId,
    action: nextActive ? "product.activated" : "product.deactivated",
    entityType: "product",
    entityId: id,
  });
  revalidatePath("/app/produtos");
}
