-- 0003_memberships_and_units.sql
-- Vínculos usuário<->organização (memberships), unidades e acesso por unidade.

-- ---------------------------------------------------------------------------
-- organization_memberships: papel do usuário dentro de uma organização.
-- ---------------------------------------------------------------------------
create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role app_role not null default 'viewer',
  status membership_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Um usuário só pode ter UM vínculo por organização.
  constraint memberships_unique_user_org unique (organization_id, user_id)
);

create trigger trg_memberships_updated_at
  before update on public.organization_memberships
  for each row execute function app_private.set_updated_at();

create index idx_memberships_user on public.organization_memberships (user_id);
create index idx_memberships_org on public.organization_memberships (organization_id);

-- ---------------------------------------------------------------------------
-- units: filial/unidade operacional de uma organização.
-- ---------------------------------------------------------------------------
create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug citext not null,
  phone text,
  email citext,
  timezone text not null default 'America/Sao_Paulo',
  address_line text,
  address_number text,
  address_complement text,
  neighborhood text,
  city text,
  state text,
  postal_code text,
  country text not null default 'BR',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint units_slug_unique_per_org unique (organization_id, slug),
  constraint units_name_len check (char_length(name) between 1 and 120)
);

create trigger trg_units_updated_at
  before update on public.units
  for each row execute function app_private.set_updated_at();

create index idx_units_org on public.units (organization_id);

-- ---------------------------------------------------------------------------
-- membership_unit_access: unidades que um membership pode acessar.
-- Owner/admin têm acesso implícito a TODAS as unidades (ver helpers de RLS);
-- para manager/agent/viewer o acesso é explícito por linha aqui.
-- ---------------------------------------------------------------------------
create table public.membership_unit_access (
  membership_id uuid not null references public.organization_memberships (id) on delete cascade,
  unit_id uuid not null references public.units (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (membership_id, unit_id)
);

create index idx_unit_access_unit on public.membership_unit_access (unit_id);
