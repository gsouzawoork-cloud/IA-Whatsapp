/**
 * Registro central de eventos de auditoria (servidor).
 *
 * Responde: quando, quem, onde, o quê e resultado. Os metadados passam SEMPRE
 * por `sanitizeAuditMetadata` antes de serem persistidos, garantindo que nenhum
 * segredo entre na trilha. A escrita respeita a RLS (INSERT permitido a membro
 * ativo da organização).
 */

import type { ActorType, AuditResult, Json } from "@/lib/supabase/database.types";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import { sanitizeAuditMetadata } from "./sanitize";

export interface AuditEvent {
  readonly organizationId: string;
  readonly unitId?: string | null;
  readonly actorUserId?: string | null;
  readonly actorType?: ActorType;
  readonly action: string;
  readonly entityType: string;
  readonly entityId?: string | null;
  readonly result?: AuditResult;
  readonly metadata?: Record<string, unknown>;
  readonly requestId?: string | null;
}

/**
 * Persiste um evento de auditoria. Falhas de auditoria não devem derrubar a
 * operação principal, mas também não são silenciadas: retornam um erro legível
 * para quem chama decidir (normalmente, registrar em log de servidor).
 */
export async function recordAuditEvent(
  supabase: TypedSupabaseClient,
  event: AuditEvent,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.from("audit_logs").insert({
    organization_id: event.organizationId,
    unit_id: event.unitId ?? null,
    actor_user_id: event.actorUserId ?? null,
    actor_type: event.actorType ?? "user",
    action: event.action,
    entity_type: event.entityType,
    entity_id: event.entityId ?? null,
    result: event.result ?? "success",
    metadata: sanitizeAuditMetadata(event.metadata ?? {}) as Json,
    request_id: event.requestId ?? null,
  });

  if (error) {
    return { ok: false, error: "Falha ao registrar auditoria." };
  }
  return { ok: true };
}
