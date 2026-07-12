/**
 * Contratos de repositório.
 *
 * Os componentes NÃO conhecem SQL nem RLS: falam com repositórios tipados. Há
 * duas famílias de implementação — Demo (mocks/estado local) e Supabase (banco
 * real sob RLS) — que compartilham estes contratos. Isso permite reutilizar a
 * interface, manter a demonstração e substituir os dados gradualmente.
 */

import type { AvailabilityMode } from "@/lib/supabase/database.types";

export interface CatalogProduct {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly priceCents: number;
  readonly isActive: boolean;
  readonly availabilityMode: AvailabilityMode;
}

export interface NewCatalogProduct {
  readonly name: string;
  readonly description?: string;
  readonly category?: string;
  readonly priceCents: number;
  readonly availabilityMode?: AvailabilityMode;
}

export interface CatalogRepository {
  listProducts(): Promise<readonly CatalogProduct[]>;
  createProduct(input: NewCatalogProduct): Promise<CatalogProduct>;
  setProductActive(id: string, isActive: boolean): Promise<void>;
}

export interface DeliveryZone {
  readonly id: string;
  readonly name: string;
  readonly neighborhoods: readonly string[];
  readonly deliveryFeeCents: number;
  readonly minimumOrderCents: number;
  readonly estimatedMinMinutes: number;
  readonly estimatedMaxMinutes: number;
  readonly isActive: boolean;
}

export interface NewDeliveryZone {
  readonly name: string;
  readonly neighborhoods: readonly string[];
  readonly deliveryFeeCents: number;
  readonly minimumOrderCents: number;
  readonly estimatedMinMinutes: number;
  readonly estimatedMaxMinutes: number;
}

export interface DeliveryRepository {
  listZones(): Promise<readonly DeliveryZone[]>;
  createZone(input: NewDeliveryZone): Promise<DeliveryZone>;
  setZoneActive(id: string, isActive: boolean): Promise<void>;
}

export interface AgentSettings {
  readonly agentName: string;
  readonly introductionMessage: string;
  readonly tone: string;
  readonly formalityLevel: number;
  readonly emojiUsage: string;
  readonly automaticServiceEnabled: boolean;
  readonly humanHandoffEnabled: boolean;
  readonly canSearchCatalog: boolean;
  readonly canCheckAvailability: boolean;
  readonly canQuoteDelivery: boolean;
  readonly canCreateOrderDraft: boolean;
  readonly canInformOrderStatus: boolean;
  readonly canSuggestAlternatives: boolean;
}

export interface AgentRepository {
  getSettings(): Promise<AgentSettings | null>;
  updateSettings(patch: Partial<AgentSettings>): Promise<void>;
}
