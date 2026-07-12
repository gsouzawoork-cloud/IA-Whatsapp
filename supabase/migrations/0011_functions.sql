-- 0011_functions.sql
-- Funções auxiliares de segurança (schema privado) e criação transacional da
-- organização.
--
-- Todas as funções de checagem são SECURITY DEFINER e STABLE. Sendo DEFINER,
-- elas consultam `organization_memberships` IGNORANDO a RLS — isso é intencional
-- e evita RECURSÃO: as policies de RLS chamam estas funções em vez de fazer
-- subselects na própria tabela protegida. O `search_path` é fixado para evitar
-- sequestro de resolução de nomes.

-- É membro ATIVO da organização?
create or replace function app_private.is_active_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = p_org
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

-- Papel do usuário atual na organização (null se não for membro ativo).
create or replace function app_private.current_role(p_org uuid)
returns app_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select m.role
  from public.organization_memberships m
  where m.organization_id = p_org
    and m.user_id = auth.uid()
    and m.status = 'active'
  limit 1;
$$;

-- Usuário atual possui um dos papéis informados na organização?
create or replace function app_private.has_org_role(p_org uuid, p_roles app_role[])
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select app_private.current_role(p_org) = any (p_roles);
$$;

-- Pode acessar a unidade? Owner/admin: todas as unidades da org. Demais papéis:
-- somente unidades explicitamente concedidas em membership_unit_access.
create or replace function app_private.can_access_unit(p_unit uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.units u
    join public.organization_memberships m
      on m.organization_id = u.organization_id
     and m.user_id = auth.uid()
     and m.status = 'active'
    where u.id = p_unit
      and (
        m.role in ('owner', 'admin')
        or exists (
          select 1 from public.membership_unit_access a
          where a.membership_id = m.id and a.unit_id = u.id
        )
      )
  );
$$;

grant execute on function app_private.is_active_member(uuid) to authenticated;
grant execute on function app_private.current_role(uuid) to authenticated;
grant execute on function app_private.has_org_role(uuid, app_role[]) to authenticated;
grant execute on function app_private.can_access_unit(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- create_organization_with_owner: cria empresa + owner + unidade + módulos +
-- configurações iniciais de forma ATÔMICA. Se qualquer passo falhar, nada é
-- persistido (função roda em uma única transação).
--
-- Segurança:
--   * SECURITY DEFINER com search_path fixo.
--   * O `created_by`/owner é SEMPRE auth.uid() — o cliente NÃO escolhe.
--   * Exige usuário autenticado.
--   * Concedida apenas a `authenticated`.
-- ---------------------------------------------------------------------------
create or replace function public.create_organization_with_owner(
  p_display_name text,
  p_slug text,
  p_business_type business_type,
  p_unit_name text default 'Unidade principal',
  p_timezone text default 'America/Sao_Paulo'
)
returns table (organization_id uuid, unit_id uuid)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_org uuid;
  v_unit uuid;
  v_module app_module;
  v_default_modules app_module[];
begin
  if v_uid is null then
    raise exception 'Usuário não autenticado' using errcode = '28000';
  end if;

  if coalesce(char_length(trim(p_display_name)), 0) = 0 then
    raise exception 'Nome da empresa é obrigatório' using errcode = '22000';
  end if;

  insert into public.organizations (display_name, slug, business_type, timezone, created_by)
  values (trim(p_display_name), lower(trim(p_slug)), p_business_type, p_timezone, v_uid)
  returning id into v_org;

  insert into public.organization_memberships (organization_id, user_id, role, status)
  values (v_org, v_uid, 'owner', 'active');

  insert into public.units (organization_id, name, slug, timezone)
  values (v_org, p_unit_name, 'principal', p_timezone)
  returning id into v_unit;

  insert into public.business_profiles (organization_id) values (v_org);
  insert into public.onboarding_progress (organization_id, current_step) values (v_org, 'empresa');
  insert into public.agent_settings (organization_id, unit_id) values (v_org, v_unit);

  -- Módulos padrão por segmento (ativação condicional; nada de estoque para
  -- quem não precisa).
  v_default_modules := case p_business_type
    when 'food_service' then array['conversations','customers','catalog','product_availability','orders','preparation_queue','delivery','agent_configuration']::app_module[]
    when 'retail'       then array['conversations','customers','catalog','product_availability','orders','delivery','agent_configuration']::app_module[]
    when 'services'     then array['conversations','customers','agent_configuration']::app_module[]
    else array['conversations','customers','agent_configuration']::app_module[]
  end;

  foreach v_module in array (enum_range(null::app_module)) loop
    insert into public.organization_modules (organization_id, module, enabled, configured_at)
    values (v_org, v_module, v_module = any (v_default_modules), now());
  end loop;

  return query select v_org, v_unit;
end;
$$;

revoke all on function public.create_organization_with_owner(text, text, business_type, text, text) from public, anon;
grant execute on function public.create_organization_with_owner(text, text, business_type, text, text) to authenticated;
