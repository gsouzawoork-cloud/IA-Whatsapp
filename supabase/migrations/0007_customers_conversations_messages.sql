-- 0007_customers_conversations_messages.sql
-- Clientes, conversas e mensagens. Canal apenas 'simulation' nesta fase.

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  unit_id uuid references public.units (id) on delete set null,
  name text not null default '',
  phone_normalized text not null,
  email citext,
  address_line text,
  address_number text,
  address_complement text,
  neighborhood text,
  city text,
  postal_code text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Mesmo telefone pode existir em empresas diferentes, mas é único DENTRO da org.
  constraint customers_phone_unique_per_org unique (organization_id, phone_normalized)
);

create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function app_private.set_updated_at();

create index idx_customers_org on public.customers (organization_id);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  unit_id uuid not null references public.units (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  channel conversation_channel not null default 'simulation',
  status conversation_status not null default 'open',
  assigned_user_id uuid references auth.users (id) on delete set null,
  agent_mode agent_mode not null default 'ai',
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_conversations_updated_at
  before update on public.conversations
  for each row execute function app_private.set_updated_at();

create index idx_conversations_org on public.conversations (organization_id);
create index idx_conversations_unit_status on public.conversations (unit_id, status);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  unit_id uuid not null references public.units (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_type message_sender not null,
  sender_user_id uuid references auth.users (id) on delete set null,
  content text not null,
  message_type message_type not null default 'text',
  created_at timestamptz not null default now()
);

create index idx_messages_conversation on public.messages (conversation_id, created_at);
create index idx_messages_org on public.messages (organization_id);
