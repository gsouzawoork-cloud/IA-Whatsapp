/**
 * Implementação Supabase do DeliveryRepository (sob RLS).
 */

import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type {
  DeliveryRepository,
  DeliveryZone,
  NewDeliveryZone,
} from "../contracts";

export function createSupabaseDeliveryRepository(
  supabase: TypedSupabaseClient,
  organizationId: string,
  unitId: string | null,
): DeliveryRepository {
  return {
    async listZones() {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("id, name, neighborhoods, delivery_fee_cents, minimum_order_cents, estimated_min_minutes, estimated_max_minutes, is_active")
        .eq("organization_id", organizationId)
        .order("name", { ascending: true });
      if (error) {
        throw new Error("Não foi possível carregar as zonas de entrega.");
      }
      return (data ?? []).map(mapZone);
    },

    async createZone(input: NewDeliveryZone) {
      if (unitId === null) {
        throw new Error("Selecione uma unidade antes de cadastrar zonas.");
      }
      const { data, error } = await supabase
        .from("delivery_zones")
        .insert({
          organization_id: organizationId,
          unit_id: unitId,
          name: input.name,
          neighborhoods: [...input.neighborhoods],
          delivery_fee_cents: input.deliveryFeeCents,
          minimum_order_cents: input.minimumOrderCents,
          estimated_min_minutes: input.estimatedMinMinutes,
          estimated_max_minutes: input.estimatedMaxMinutes,
        })
        .select("id, name, neighborhoods, delivery_fee_cents, minimum_order_cents, estimated_min_minutes, estimated_max_minutes, is_active")
        .single();
      if (error || !data) {
        throw new Error("Não foi possível criar a zona de entrega.");
      }
      return mapZone(data);
    },

    async setZoneActive(id: string, isActive: boolean) {
      const { error } = await supabase
        .from("delivery_zones")
        .update({ is_active: isActive })
        .eq("organization_id", organizationId)
        .eq("id", id);
      if (error) {
        throw new Error("Não foi possível atualizar a zona de entrega.");
      }
    },
  };
}

type ZoneRow = {
  id: string;
  name: string;
  neighborhoods: string[];
  delivery_fee_cents: number;
  minimum_order_cents: number;
  estimated_min_minutes: number;
  estimated_max_minutes: number;
  is_active: boolean;
};

function mapZone(row: ZoneRow): DeliveryZone {
  return {
    id: row.id,
    name: row.name,
    neighborhoods: row.neighborhoods,
    deliveryFeeCents: row.delivery_fee_cents,
    minimumOrderCents: row.minimum_order_cents,
    estimatedMinMinutes: row.estimated_min_minutes,
    estimatedMaxMinutes: row.estimated_max_minutes,
    isActive: row.is_active,
  };
}
