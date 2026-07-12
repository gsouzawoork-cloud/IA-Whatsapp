-- seed.sql — Dados de DESENVOLVIMENTO local apenas. NUNCA aplicar em produção.
--
-- Cria dois tenants isolados para exercitar a RLS manualmente e nos testes:
--   * Pizzaria Forno Alto (food_service) — owner: ana@example.test
--   * Studio Aurora (services)          — owner: bruno@example.test
--
-- Não contém senhas, tokens, documentos ou telefones reais. Os telefones são
-- claramente fictícios. As linhas em auth.users existem só para satisfazer FKs
-- em ambiente local; a autenticação real acontece via Supabase Auth.

-- Usuários de teste (identidades locais mínimas).
insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.test',   '{"full_name":"Ana (owner Pizzaria)"}'),
  ('22222222-2222-2222-2222-222222222222', 'bruno@example.test', '{"full_name":"Bruno (owner Studio)"}'),
  ('33333333-3333-3333-3333-333333333333', 'caio@example.test',  '{"full_name":"Caio (agent Pizzaria)"}')
on conflict (id) do nothing;

-- profiles são criados pelo trigger on_auth_user_created; garantimos idempotência.
insert into public.profiles (id, full_name)
values
  ('11111111-1111-1111-1111-111111111111', 'Ana'),
  ('22222222-2222-2222-2222-222222222222', 'Bruno'),
  ('33333333-3333-3333-3333-333333333333', 'Caio')
on conflict (id) do nothing;

-- ---- Tenant A: Pizzaria Forno Alto (food_service) ----
insert into public.organizations (id, display_name, slug, business_type, created_by, onboarding_status)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Pizzaria Forno Alto', 'forno-alto', 'food_service',
        '11111111-1111-1111-1111-111111111111', 'completed')
on conflict (id) do nothing;

insert into public.units (id, organization_id, name, slug, city, state)
values ('aaaaaaaa-0000-0000-0000-0000000000a1', 'aaaaaaaa-0000-0000-0000-000000000001', 'Unidade Centro', 'centro', 'São Paulo', 'SP')
on conflict (id) do nothing;

insert into public.organization_memberships (organization_id, user_id, role)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'owner'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'agent')
on conflict do nothing;

insert into public.products (organization_id, unit_id, name, category, price_cents)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-0000000000a1', 'Pizza Margherita', 'Pizzas', 4990),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-0000000000a1', 'Pizza Calabresa', 'Pizzas', 5290)
on conflict do nothing;

insert into public.delivery_zones (organization_id, unit_id, name, neighborhoods, delivery_fee_cents, minimum_order_cents, estimated_min_minutes, estimated_max_minutes)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-0000000000a1', 'Centro', array['Centro','Sé'], 800, 3000, 30, 50)
on conflict do nothing;

-- ---- Tenant B: Studio Aurora (services) ----
insert into public.organizations (id, display_name, slug, business_type, created_by, onboarding_status)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'Studio Aurora', 'studio-aurora', 'services',
        '22222222-2222-2222-2222-222222222222', 'completed')
on conflict (id) do nothing;

insert into public.units (id, organization_id, name, slug, city, state)
values ('bbbbbbbb-0000-0000-0000-0000000000b1', 'bbbbbbbb-0000-0000-0000-000000000001', 'Matriz', 'matriz', 'Curitiba', 'PR')
on conflict (id) do nothing;

insert into public.organization_memberships (organization_id, user_id, role)
values ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'owner')
on conflict do nothing;
