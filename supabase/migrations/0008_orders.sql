-- 0008_orders.sql
-- Pedidos e itens de pedido. Totais em CENTAVOS. Itens usam SNAPSHOT de preço:
-- pedidos antigos nunca são recalculados com o preço atual do produto.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  unit_id uuid not null references public.units (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  conversation_id uuid references public.conversations (id) on delete set null,
  order_number text not null,
  status order_status not null default 'draft',
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  delivery_fee_cents integer not null default 0 check (delivery_fee_cents >= 0),
  discount_total_cents integer not null default 0 check (discount_total_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  fulfillment_type fulfillment_type not null default 'delivery',
  delivery_zone_id uuid references public.delivery_zones (id) on delete set null,
  delivery_address text,
  delivery_estimate_min integer check (delivery_estimate_min is null or delivery_estimate_min >= 0),
  delivery_estimate_max integer check (delivery_estimate_max is null or delivery_estimate_max >= 0),
  payment_method text,
  payment_status payment_status not null default 'unpaid',
  idempotency_key text,
  created_by_type actor_type not null default 'user',
  created_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- order_number único dentro da organização.
  constraint orders_number_unique_per_org unique (organization_id, order_number),
  -- idempotency_key evita duplicidade de pedidos (quando informada).
  constraint orders_idempotency_unique unique (organization_id, idempotency_key)
);

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function app_private.set_updated_at();

create index idx_orders_org on public.orders (organization_id);
create index idx_orders_unit_status on public.orders (unit_id, status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name_snapshot text not null,
  unit_price_snapshot_cents integer not null check (unit_price_snapshot_cents >= 0),
  quantity integer not null check (quantity > 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create index idx_order_items_order on public.order_items (order_id);
