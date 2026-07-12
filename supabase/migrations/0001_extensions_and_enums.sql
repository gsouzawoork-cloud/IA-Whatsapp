-- 0001_extensions_and_enums.sql
-- Fundação: extensões mínimas, schema privado de segurança e enums do domínio.
--
-- Princípios:
--   * Nada de tipos genéricos quando um enum tipado é mais seguro e claro.
--   * As funções auxiliares de segurança vivem em um schema NÃO exposto pela API
--     (`app_private`), para não virarem superfície de ataque via PostgREST.

create extension if not exists "pgcrypto";        -- gen_random_uuid()
create extension if not exists "citext";          -- e-mails/handles case-insensitive

-- Schema privado: helpers de RLS e lógica sensível. Removido da exposição REST.
create schema if not exists app_private;
revoke all on schema app_private from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Enums do domínio
-- ---------------------------------------------------------------------------

-- Papéis dentro de uma organização (ordem importa: usada em comparações).
create type app_role as enum ('owner', 'admin', 'manager', 'agent', 'viewer');

-- Situação do vínculo usuário<->organização.
create type membership_status as enum ('active', 'suspended');

-- Segmento inicial do negócio (dirige a ativação condicional de módulos).
create type business_type as enum ('food_service', 'retail', 'services', 'other');

-- Situação do onboarding da organização.
create type onboarding_status as enum ('pending', 'in_progress', 'completed');

-- Módulos habilitáveis por organização.
create type app_module as enum (
  'conversations',
  'customers',
  'catalog',
  'product_availability',
  'orders',
  'preparation_queue',
  'delivery',
  'agent_configuration'
);

-- Modo de controle de disponibilidade de um produto.
create type availability_mode as enum ('always_available', 'manual', 'quantity');

-- Tipo de item da base de conhecimento oficial.
create type knowledge_type as enum (
  'faq',
  'policy',
  'instruction',
  'payment_policy',
  'delivery_policy',
  'exchange_policy',
  'general_information'
);

-- Canal de uma conversa. Apenas 'simulation' nesta fase (WhatsApp virá depois).
create type conversation_channel as enum ('simulation');

-- Situação de uma conversa.
create type conversation_status as enum ('open', 'pending', 'closed');

-- Modo do agente na conversa.
create type agent_mode as enum ('ai', 'human', 'paused');

-- Quem enviou uma mensagem.
create type message_sender as enum ('customer', 'agent', 'human', 'system');

-- Tipo de conteúdo de mensagem.
create type message_type as enum ('text', 'note', 'event');

-- Situação de um pedido.
create type order_status as enum (
  'draft',
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'dispatched',
  'delivered',
  'cancelled'
);

-- Modalidade de atendimento do pedido.
create type fulfillment_type as enum ('delivery', 'pickup');

-- Situação de pagamento (sem gateway real nesta fase).
create type payment_status as enum ('unpaid', 'pending', 'paid', 'refunded');

-- Origem da criação de um registro operacional.
create type actor_type as enum ('user', 'agent', 'system');

-- Resultado de um evento de auditoria.
create type audit_result as enum ('success', 'denied', 'failure');
