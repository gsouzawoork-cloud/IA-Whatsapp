-- 0006_delivery.sql
-- Zonas de entrega por unidade. Sem cálculo por distância real nesta fase:
-- a cotação é determinística a partir de zonas cadastradas (bairro/CEP).

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  unit_id uuid not null references public.units (id) on delete cascade,
  name text not null,
  neighborhoods text[] not null default '{}',
  postal_code_start text,
  postal_code_end text,
  delivery_fee_cents integer not null default 0 check (delivery_fee_cents >= 0),
  minimum_order_cents integer not null default 0 check (minimum_order_cents >= 0),
  free_delivery_threshold_cents integer check (
    free_delivery_threshold_cents is null or free_delivery_threshold_cents >= 0
  ),
  estimated_min_minutes integer not null default 0 check (estimated_min_minutes >= 0),
  estimated_max_minutes integer not null default 0 check (estimated_max_minutes >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint delivery_zone_name_len check (char_length(name) between 1 and 120),
  constraint delivery_estimate_coherent check (estimated_max_minutes >= estimated_min_minutes)
);

create trigger trg_delivery_zones_updated_at
  before update on public.delivery_zones
  for each row execute function app_private.set_updated_at();

create index idx_delivery_zones_unit on public.delivery_zones (unit_id);
