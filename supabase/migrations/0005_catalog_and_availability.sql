-- 0005_catalog_and_availability.sql
-- Catálogo (produtos/serviços) e disponibilidade por unidade.
-- Preços em CENTAVOS (inteiros) — determinístico, sem ponto flutuante.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  unit_id uuid references public.units (id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null default '',
  sku text,
  price_cents integer not null default 0 check (price_cents >= 0),
  is_active boolean not null default true,
  availability_mode availability_mode not null default 'always_available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_len check (char_length(name) between 1 and 160)
);

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function app_private.set_updated_at();

create index idx_products_org on public.products (organization_id);
create index idx_products_org_active on public.products (organization_id, is_active);

-- Disponibilidade concreta de um produto em uma unidade.
create table public.product_availability (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  unit_id uuid not null references public.units (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  is_available boolean not null default true,
  quantity integer check (quantity is null or quantity >= 0),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_unique_per_unit unique (product_id, unit_id)
);

create trigger trg_availability_updated_at
  before update on public.product_availability
  for each row execute function app_private.set_updated_at();

create index idx_availability_unit on public.product_availability (unit_id);
