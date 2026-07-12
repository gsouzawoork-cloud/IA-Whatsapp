-- 0004_modules_and_business_profile.sql
-- Módulos habilitados por organização, perfil do negócio, horários e base de
-- conhecimento oficial.

-- ---------------------------------------------------------------------------
-- organization_modules: quais módulos opcionais a empresa habilitou.
-- ---------------------------------------------------------------------------
create table public.organization_modules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  module app_module not null,
  enabled boolean not null default false,
  configured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint modules_unique_per_org unique (organization_id, module)
);

create trigger trg_modules_updated_at
  before update on public.organization_modules
  for each row execute function app_private.set_updated_at();

create index idx_modules_org on public.organization_modules (organization_id);

-- ---------------------------------------------------------------------------
-- business_profiles: identidade e políticas gerais do negócio (1:1 com org).
-- ---------------------------------------------------------------------------
create table public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  description text not null default '',
  value_proposition text,
  service_area_description text,
  default_language text not null default 'pt-BR',
  default_tone text not null default 'friendly',
  human_handoff_policy text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_business_profiles_updated_at
  before update on public.business_profiles
  for each row execute function app_private.set_updated_at();

-- ---------------------------------------------------------------------------
-- business_hours: horários de funcionamento por unidade e dia da semana.
-- weekday: 0=domingo ... 6=sábado (padrão ISO alternativo documentado).
-- ---------------------------------------------------------------------------
create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  unit_id uuid not null references public.units (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Se aberto, precisa de horário coerente; se fechado, horários são nulos.
  constraint business_hours_coherent check (
    (is_closed and opens_at is null and closes_at is null)
    or (not is_closed and opens_at is not null and closes_at is not null and closes_at > opens_at)
  )
);

create trigger trg_business_hours_updated_at
  before update on public.business_hours
  for each row execute function app_private.set_updated_at();

create index idx_business_hours_unit on public.business_hours (unit_id);

-- ---------------------------------------------------------------------------
-- knowledge_items: base oficial de informações que a IA poderá consultar.
-- Sem embeddings nesta fase — apenas conteúdo estruturado e priorizado.
-- ---------------------------------------------------------------------------
create table public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  unit_id uuid references public.units (id) on delete cascade,
  type knowledge_type not null default 'general_information',
  title text not null,
  content text not null,
  is_active boolean not null default true,
  priority smallint not null default 0,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint knowledge_title_len check (char_length(title) between 1 and 160)
);

create trigger trg_knowledge_updated_at
  before update on public.knowledge_items
  for each row execute function app_private.set_updated_at();

create index idx_knowledge_org on public.knowledge_items (organization_id);
