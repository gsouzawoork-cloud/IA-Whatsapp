/**
 * Tipos do banco (schema `public`).
 *
 * Mantidos à mão nesta fase para espelhar `supabase/migrations`. Quando houver
 * um projeto Supabase configurado, gere e substitua por:
 *
 *   supabase gen types typescript --local > src/lib/supabase/database.types.ts
 *
 * O formato segue o gerador oficial (Row/Insert/Update por tabela + Enums), de
 * modo que os clients e repositórios já são fortemente tipados.
 *
 * NOTA TÉCNICA: os shapes de linha são `type` (não `interface`) de propósito —
 * o constraint `GenericSchema` do supabase-js exige `Record<string, unknown>`,
 * e apenas type aliases (não interfaces) satisfazem essa atribuição estrutural.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enums do domínio (espelham 0001_extensions_and_enums.sql).
export type AppRole = "owner" | "admin" | "manager" | "agent" | "viewer";
export type MembershipStatus = "active" | "suspended";
export type BusinessType = "food_service" | "retail" | "services" | "other";
export type OnboardingStatus = "pending" | "in_progress" | "completed";
export type AppModule =
  | "conversations"
  | "customers"
  | "catalog"
  | "product_availability"
  | "orders"
  | "preparation_queue"
  | "delivery"
  | "agent_configuration";
export type AvailabilityMode = "always_available" | "manual" | "quantity";
export type KnowledgeType =
  | "faq"
  | "policy"
  | "instruction"
  | "payment_policy"
  | "delivery_policy"
  | "exchange_policy"
  | "general_information";
export type ConversationChannel = "simulation";
export type ConversationStatus = "open" | "pending" | "closed";
export type AgentMode = "ai" | "human" | "paused";
export type MessageSender = "customer" | "agent" | "human" | "system";
export type MessageType = "text" | "note" | "event";
export type OrderStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "dispatched"
  | "delivered"
  | "cancelled";
export type FulfillmentType = "delivery" | "pickup";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded";
export type ActorType = "user" | "agent" | "system";
export type AuditResult = "success" | "denied" | "failure";

/** Tabela com defaults de Insert/Update no formato do gerador oficial. */
type TableShape<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type Timestamps = { created_at: string; updated_at: string };

type ProfileRow = Timestamps & {
  id: string;
  full_name: string;
  avatar_url: string | null;
  locale: string;
};
type OrganizationRow = Timestamps & {
  id: string;
  display_name: string;
  legal_name: string | null;
  slug: string;
  business_type: BusinessType;
  document: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  locale: string;
  onboarding_status: OnboardingStatus;
  created_by: string;
};
type MembershipRow = Timestamps & {
  id: string;
  organization_id: string;
  user_id: string;
  role: AppRole;
  status: MembershipStatus;
};
type UnitRow = Timestamps & {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  timezone: string;
  address_line: string | null;
  address_number: string | null;
  address_complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_active: boolean;
};
type ModuleRow = Timestamps & {
  id: string;
  organization_id: string;
  module: AppModule;
  enabled: boolean;
  configured_at: string | null;
};
type BusinessProfileRow = Timestamps & {
  id: string;
  organization_id: string;
  description: string;
  value_proposition: string | null;
  service_area_description: string | null;
  default_language: string;
  default_tone: string;
  human_handoff_policy: string;
};
type BusinessHoursRow = Timestamps & {
  id: string;
  organization_id: string;
  unit_id: string;
  weekday: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
};
type KnowledgeRow = Timestamps & {
  id: string;
  organization_id: string;
  unit_id: string | null;
  type: KnowledgeType;
  title: string;
  content: string;
  is_active: boolean;
  priority: number;
  created_by: string | null;
};
type ProductRow = Timestamps & {
  id: string;
  organization_id: string;
  unit_id: string | null;
  name: string;
  description: string;
  category: string;
  sku: string | null;
  price_cents: number;
  is_active: boolean;
  availability_mode: AvailabilityMode;
};
type AvailabilityRow = Timestamps & {
  id: string;
  organization_id: string;
  unit_id: string;
  product_id: string;
  is_available: boolean;
  quantity: number | null;
  updated_by: string | null;
};
type DeliveryZoneRow = Timestamps & {
  id: string;
  organization_id: string;
  unit_id: string;
  name: string;
  neighborhoods: string[];
  postal_code_start: string | null;
  postal_code_end: string | null;
  delivery_fee_cents: number;
  minimum_order_cents: number;
  free_delivery_threshold_cents: number | null;
  estimated_min_minutes: number;
  estimated_max_minutes: number;
  is_active: boolean;
};
type CustomerRow = Timestamps & {
  id: string;
  organization_id: string;
  unit_id: string | null;
  name: string;
  phone_normalized: string;
  email: string | null;
  address_line: string | null;
  address_number: string | null;
  address_complement: string | null;
  neighborhood: string | null;
  city: string | null;
  postal_code: string | null;
  notes: string | null;
};
type ConversationRow = Timestamps & {
  id: string;
  organization_id: string;
  unit_id: string;
  customer_id: string | null;
  channel: ConversationChannel;
  status: ConversationStatus;
  assigned_user_id: string | null;
  agent_mode: AgentMode;
  last_message_at: string | null;
};
type MessageRow = {
  id: string;
  organization_id: string;
  unit_id: string;
  conversation_id: string;
  sender_type: MessageSender;
  sender_user_id: string | null;
  content: string;
  message_type: MessageType;
  created_at: string;
};
type OrderRow = Timestamps & {
  id: string;
  organization_id: string;
  unit_id: string;
  customer_id: string | null;
  conversation_id: string | null;
  order_number: string;
  status: OrderStatus;
  subtotal_cents: number;
  delivery_fee_cents: number;
  discount_total_cents: number;
  total_cents: number;
  fulfillment_type: FulfillmentType;
  delivery_zone_id: string | null;
  delivery_address: string | null;
  delivery_estimate_min: number | null;
  delivery_estimate_max: number | null;
  payment_method: string | null;
  payment_status: PaymentStatus;
  idempotency_key: string | null;
  created_by_type: ActorType;
  created_by_user_id: string | null;
};
type OrderItemRow = {
  id: string;
  organization_id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_price_snapshot_cents: number;
  quantity: number;
  line_total_cents: number;
  notes: string | null;
  created_at: string;
};
type AgentSettingsRow = Timestamps & {
  id: string;
  organization_id: string;
  unit_id: string | null;
  agent_name: string;
  introduction_message: string;
  tone: string;
  formality_level: number;
  emoji_usage: string;
  automatic_service_enabled: boolean;
  human_handoff_enabled: boolean;
  can_search_catalog: boolean;
  can_check_availability: boolean;
  can_quote_delivery: boolean;
  can_create_order_draft: boolean;
  can_inform_order_status: boolean;
  can_suggest_alternatives: boolean;
};
type OnboardingRow = Timestamps & {
  id: string;
  organization_id: string;
  current_step: string;
  completed_steps: string[];
  completed_at: string | null;
};
type AuditRow = {
  id: string;
  organization_id: string;
  unit_id: string | null;
  actor_user_id: string | null;
  actor_type: ActorType;
  action: string;
  entity_type: string;
  entity_id: string | null;
  result: AuditResult;
  metadata: Json;
  request_id: string | null;
  created_at: string;
};
type UnitAccessRow = {
  membership_id: string;
  unit_id: string;
  created_at: string;
};

// Insert/Update permissivos (campos com default são opcionais no Insert).
type Insertable<Row> = Partial<Row> & { organization_id?: string };

export type Database = {
  public: {
    Tables: {
      profiles: TableShape<ProfileRow, Insertable<ProfileRow> & { id: string }, Partial<ProfileRow>>;
      organizations: TableShape<OrganizationRow, Insertable<OrganizationRow>, Partial<OrganizationRow>>;
      organization_memberships: TableShape<MembershipRow, Insertable<MembershipRow>, Partial<MembershipRow>>;
      units: TableShape<UnitRow, Insertable<UnitRow>, Partial<UnitRow>>;
      membership_unit_access: TableShape<
        UnitAccessRow,
        { membership_id: string; unit_id: string },
        Partial<UnitAccessRow>
      >;
      organization_modules: TableShape<ModuleRow, Insertable<ModuleRow>, Partial<ModuleRow>>;
      business_profiles: TableShape<BusinessProfileRow, Insertable<BusinessProfileRow>, Partial<BusinessProfileRow>>;
      business_hours: TableShape<BusinessHoursRow, Insertable<BusinessHoursRow>, Partial<BusinessHoursRow>>;
      knowledge_items: TableShape<KnowledgeRow, Insertable<KnowledgeRow>, Partial<KnowledgeRow>>;
      products: TableShape<ProductRow, Insertable<ProductRow>, Partial<ProductRow>>;
      product_availability: TableShape<AvailabilityRow, Insertable<AvailabilityRow>, Partial<AvailabilityRow>>;
      delivery_zones: TableShape<DeliveryZoneRow, Insertable<DeliveryZoneRow>, Partial<DeliveryZoneRow>>;
      customers: TableShape<CustomerRow, Insertable<CustomerRow>, Partial<CustomerRow>>;
      conversations: TableShape<ConversationRow, Insertable<ConversationRow>, Partial<ConversationRow>>;
      messages: TableShape<MessageRow, Insertable<MessageRow>, Partial<MessageRow>>;
      orders: TableShape<OrderRow, Insertable<OrderRow>, Partial<OrderRow>>;
      order_items: TableShape<OrderItemRow, Insertable<OrderItemRow>, Partial<OrderItemRow>>;
      agent_settings: TableShape<AgentSettingsRow, Insertable<AgentSettingsRow>, Partial<AgentSettingsRow>>;
      onboarding_progress: TableShape<OnboardingRow, Insertable<OnboardingRow>, Partial<OnboardingRow>>;
      audit_logs: TableShape<AuditRow, Insertable<AuditRow>, Partial<AuditRow>>;
    };
    Views: Record<never, never>;
    Functions: {
      create_organization_with_owner: {
        Args: {
          p_display_name: string;
          p_slug: string;
          p_business_type: BusinessType;
          p_unit_name?: string;
          p_timezone?: string;
        };
        Returns: { organization_id: string; unit_id: string }[];
      };
    };
    Enums: {
      app_role: AppRole;
      membership_status: MembershipStatus;
      business_type: BusinessType;
      onboarding_status: OnboardingStatus;
      app_module: AppModule;
      availability_mode: AvailabilityMode;
      knowledge_type: KnowledgeType;
      conversation_channel: ConversationChannel;
      conversation_status: ConversationStatus;
      agent_mode: AgentMode;
      message_sender: MessageSender;
      message_type: MessageType;
      order_status: OrderStatus;
      fulfillment_type: FulfillmentType;
      payment_status: PaymentStatus;
      actor_type: ActorType;
      audit_result: AuditResult;
    };
    CompositeTypes: Record<never, never>;
  };
};
