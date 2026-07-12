-- rls_isolation.test.sql — Testes de isolamento multiempresa (pgTAP).
--
-- Execução: `supabase test db` (requer Docker/Supabase local). Não foi possível
-- executar neste ambiente; a sintaxe segue o padrão pgTAP + auth do Supabase.
--
-- Depende dos dados de supabase/seed.sql (tenants Pizzaria e Studio Aurora).

begin;
select plan(15);

-- Helper local: assume a identidade de um usuário (define role + claim sub).
create or replace function tests.authenticate_as(p_user uuid)
returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', p_user)::text, true);
end;
$$;

-- Identidades do seed.
-- Ana  = owner Pizzaria (aaaa...0001)
-- Bruno= owner Studio   (bbbb...0001)
-- Caio = agent Pizzaria

-- 1) Ana enxerga a própria organização.
select tests.authenticate_as('11111111-1111-1111-1111-111111111111');
select is(
  (select count(*)::int from public.organizations where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  1, 'owner enxerga a própria organização');

-- 2) Ana NÃO enxerga a organização da empresa B.
select is(
  (select count(*)::int from public.organizations where id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  0, 'empresa A não enxerga organização da empresa B');

-- 3) Ana NÃO lê clientes da empresa B (nenhuma linha vaza).
select is(
  (select count(*)::int from public.customers where organization_id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  0, 'empresa A não lê clientes da empresa B');

-- 4) Ana NÃO lê produtos da empresa B.
select is(
  (select count(*)::int from public.products where organization_id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  0, 'empresa A não lê produtos da empresa B');

-- 5) Ana NÃO lê pedidos da empresa B.
select is(
  (select count(*)::int from public.orders where organization_id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  0, 'empresa A não lê pedidos da empresa B');

-- 6) Ana NÃO lê mensagens da empresa B.
select is(
  (select count(*)::int from public.messages where organization_id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  0, 'empresa A não lê mensagens da empresa B');

-- 7) Ana NÃO altera unidade da empresa B (update não afeta nenhuma linha).
select lives_ok(
  $$ update public.units set name = 'hack' where organization_id = 'bbbbbbbb-0000-0000-0000-000000000001' $$,
  'update em unidade de outra empresa não gera erro mas...');
select is(
  (select count(*)::int from public.units where organization_id = 'bbbbbbbb-0000-0000-0000-000000000001' and name = 'hack'),
  0, '...não altera nenhuma unidade da empresa B (RLS)');

-- 8) Agent NÃO altera preço de produto (write negado para role agent).
select tests.authenticate_as('33333333-3333-3333-3333-333333333333');
prepare agent_price_update as
  update public.products set price_cents = 1
  where organization_id = 'aaaaaaaa-0000-0000-0000-000000000001';
-- RLS impede: 0 linhas afetadas.
select lives_ok('execute agent_price_update', 'update de preço pelo agent não gera erro');
select is(
  (select count(*)::int from public.products
    where organization_id = 'aaaaaaaa-0000-0000-0000-000000000001' and price_cents = 1),
  0, 'agent não consegue alterar preço (RLS write)');

-- 9) Inserção com organization_id alheio falha (WITH CHECK).
select tests.authenticate_as('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ insert into public.products (organization_id, name, price_cents)
     values ('bbbbbbbb-0000-0000-0000-000000000001', 'intruso', 100) $$,
  '42501', null, 'inserção em organização alheia é bloqueada');

-- 10) Troca de organization_id em update falha (trigger de imutabilidade).
select throws_ok(
  $$ update public.products set organization_id = 'bbbbbbbb-0000-0000-0000-000000000001'
     where organization_id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  '42501', null, 'trocar organization_id de um registro é bloqueado');

-- 11) Owner consegue alterar configurações (business_profile).
select lives_ok(
  $$ update public.business_profiles set description = 'Atualizado'
     where organization_id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  'owner altera configurações da própria empresa');

-- 12) Usuário sem membership não acessa organização alguma.
select tests.authenticate_as('00000000-0000-0000-0000-0000000000ff');
select is(
  (select count(*)::int from public.organizations),
  0, 'usuário sem membership não acessa nenhuma organização');

-- 13) Usuário suspenso perde acesso (simula suspensão do agent Caio).
select tests.authenticate_as('11111111-1111-1111-1111-111111111111');
update public.organization_memberships set status = 'suspended'
  where user_id = '33333333-3333-3333-3333-333333333333';
select tests.authenticate_as('33333333-3333-3333-3333-333333333333');
select is(
  (select count(*)::int from public.products where organization_id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  0, 'membership suspenso perde acesso aos dados');

select * from finish();
rollback;
