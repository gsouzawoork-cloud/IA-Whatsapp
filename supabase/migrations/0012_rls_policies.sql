-- 0012_rls_policies.sql
-- Row Level Security em TODAS as tabelas com dados de usuários/empresas.
--
-- Regras de ouro aplicadas aqui:
--   * Nenhuma policy USING (true)/WITH CHECK (true) em tabela multiempresa.
--   * Toda leitura exige membership ATIVO na organização (helpers DEFINER).
--   * Tabelas por unidade também exigem acesso à unidade.
--   * Escrita exige o papel adequado (owner/admin/manager/agent).
--   * organization_id é IMUTÁVEL (trigger) — ninguém "migra" um registro de
--     empresa.
--   * O usuário não pode elevar o próprio papel (trigger).

-- Guarda: impedir troca de organization_id em UPDATE.
create or replace function app_private.forbid_org_change()
returns trigger
language plpgsql
as $$
begin
  if new.organization_id is distinct from old.organization_id then
    raise exception 'organization_id é imutável' using errcode = '42501';
  end if;
  return new;
end;
$$;

-- Guarda: usuário não pode alterar o próprio papel/status de membership.
create or replace function app_private.forbid_self_role_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.user_id = auth.uid()
     and (new.role is distinct from old.role or new.status is distinct from old.status) then
    raise exception 'Você não pode alterar o próprio papel ou status' using errcode = '42501';
  end if;
  return new;
end;
$$;

-- Papéis que gerenciam configuração/administração e operação (constantes SQL).
-- (Inlined nas policies; documentado aqui para leitura.)
--   admin  => owner, admin
--   manage => owner, admin, manager
--   operate=> owner, admin, manager, agent

-- ===========================================================================
-- profiles
-- ===========================================================================
alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ===========================================================================
-- organizations
-- ===========================================================================
alter table public.organizations enable row level security;

create policy organizations_select on public.organizations
  for select using (app_private.is_active_member(id));
-- INSERT direto é bloqueado: organizações nascem via create_organization_with_owner.
create policy organizations_update on public.organizations
  for update using (app_private.has_org_role(id, array['owner','admin']::app_role[]))
  with check (app_private.has_org_role(id, array['owner','admin']::app_role[]));

-- ===========================================================================
-- organization_memberships
-- ===========================================================================
alter table public.organization_memberships enable row level security;

create trigger trg_membership_self_role
  before update on public.organization_memberships
  for each row execute function app_private.forbid_self_role_change();

-- Qualquer membro ativo enxerga a equipe da própria organização.
create policy memberships_select on public.organization_memberships
  for select using (app_private.is_active_member(organization_id));
create policy memberships_insert on public.organization_memberships
  for insert with check (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]));
create policy memberships_update on public.organization_memberships
  for update using (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]))
  with check (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]));
create policy memberships_delete on public.organization_memberships
  for delete using (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]));

-- ===========================================================================
-- units
-- ===========================================================================
alter table public.units enable row level security;
create trigger trg_units_org_immutable before update on public.units
  for each row execute function app_private.forbid_org_change();

create policy units_select on public.units
  for select using (app_private.is_active_member(organization_id) and app_private.can_access_unit(id));
create policy units_insert on public.units
  for insert with check (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]));
create policy units_update on public.units
  for update using (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]))
  with check (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]));
create policy units_delete on public.units
  for delete using (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]));

-- ===========================================================================
-- membership_unit_access
-- ===========================================================================
alter table public.membership_unit_access enable row level security;

create policy unit_access_select on public.membership_unit_access
  for select using (
    exists (
      select 1 from public.organization_memberships m
      where m.id = membership_id and app_private.is_active_member(m.organization_id)
    )
  );
create policy unit_access_write on public.membership_unit_access
  for all using (
    exists (
      select 1 from public.organization_memberships m
      where m.id = membership_id
        and app_private.has_org_role(m.organization_id, array['owner','admin']::app_role[])
    )
  ) with check (
    exists (
      select 1 from public.organization_memberships m
      where m.id = membership_id
        and app_private.has_org_role(m.organization_id, array['owner','admin']::app_role[])
    )
  );

-- ===========================================================================
-- organization_modules
-- ===========================================================================
alter table public.organization_modules enable row level security;
create trigger trg_modules_org_immutable before update on public.organization_modules
  for each row execute function app_private.forbid_org_change();

create policy modules_select on public.organization_modules
  for select using (app_private.is_active_member(organization_id));
create policy modules_write on public.organization_modules
  for all using (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]))
  with check (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]));

-- ===========================================================================
-- business_profiles
-- ===========================================================================
alter table public.business_profiles enable row level security;
create trigger trg_bprofile_org_immutable before update on public.business_profiles
  for each row execute function app_private.forbid_org_change();

create policy bprofile_select on public.business_profiles
  for select using (app_private.is_active_member(organization_id));
create policy bprofile_write on public.business_profiles
  for all using (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]))
  with check (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]));

-- ===========================================================================
-- business_hours (manage: owner/admin/manager)
-- ===========================================================================
alter table public.business_hours enable row level security;
create trigger trg_bhours_org_immutable before update on public.business_hours
  for each row execute function app_private.forbid_org_change();

create policy bhours_select on public.business_hours
  for select using (app_private.is_active_member(organization_id) and app_private.can_access_unit(unit_id));
create policy bhours_write on public.business_hours
  for all using (app_private.has_org_role(organization_id, array['owner','admin','manager']::app_role[]))
  with check (app_private.has_org_role(organization_id, array['owner','admin','manager']::app_role[]));

-- ===========================================================================
-- knowledge_items (manage: owner/admin/manager; read: any member)
-- ===========================================================================
alter table public.knowledge_items enable row level security;
create trigger trg_knowledge_org_immutable before update on public.knowledge_items
  for each row execute function app_private.forbid_org_change();

create policy knowledge_select on public.knowledge_items
  for select using (app_private.is_active_member(organization_id));
create policy knowledge_write on public.knowledge_items
  for all using (app_private.has_org_role(organization_id, array['owner','admin','manager']::app_role[]))
  with check (app_private.has_org_role(organization_id, array['owner','admin','manager']::app_role[]));

-- ===========================================================================
-- products (manage: owner/admin/manager — agent NÃO altera preço; read: member)
-- ===========================================================================
alter table public.products enable row level security;
create trigger trg_products_org_immutable before update on public.products
  for each row execute function app_private.forbid_org_change();

create policy products_select on public.products
  for select using (app_private.is_active_member(organization_id));
create policy products_write on public.products
  for all using (app_private.has_org_role(organization_id, array['owner','admin','manager']::app_role[]))
  with check (app_private.has_org_role(organization_id, array['owner','admin','manager']::app_role[]));

-- ===========================================================================
-- product_availability (manage: owner/admin/manager; read: member+unit)
-- ===========================================================================
alter table public.product_availability enable row level security;
create trigger trg_availability_org_immutable before update on public.product_availability
  for each row execute function app_private.forbid_org_change();

create policy availability_select on public.product_availability
  for select using (app_private.is_active_member(organization_id) and app_private.can_access_unit(unit_id));
create policy availability_write on public.product_availability
  for all using (
    app_private.has_org_role(organization_id, array['owner','admin','manager']::app_role[])
    and app_private.can_access_unit(unit_id)
  ) with check (
    app_private.has_org_role(organization_id, array['owner','admin','manager']::app_role[])
    and app_private.can_access_unit(unit_id)
  );

-- ===========================================================================
-- delivery_zones (manage: owner/admin/manager; read: member+unit)
-- ===========================================================================
alter table public.delivery_zones enable row level security;
create trigger trg_delivery_org_immutable before update on public.delivery_zones
  for each row execute function app_private.forbid_org_change();

create policy delivery_select on public.delivery_zones
  for select using (app_private.is_active_member(organization_id) and app_private.can_access_unit(unit_id));
create policy delivery_write on public.delivery_zones
  for all using (
    app_private.has_org_role(organization_id, array['owner','admin','manager']::app_role[])
    and app_private.can_access_unit(unit_id)
  ) with check (
    app_private.has_org_role(organization_id, array['owner','admin','manager']::app_role[])
    and app_private.can_access_unit(unit_id)
  );

-- ===========================================================================
-- customers (operate: owner/admin/manager/agent; read: member+unit)
-- ===========================================================================
alter table public.customers enable row level security;
create trigger trg_customers_org_immutable before update on public.customers
  for each row execute function app_private.forbid_org_change();

create policy customers_select on public.customers
  for select using (
    app_private.is_active_member(organization_id)
    and (unit_id is null or app_private.can_access_unit(unit_id))
  );
create policy customers_write on public.customers
  for all using (app_private.has_org_role(organization_id, array['owner','admin','manager','agent']::app_role[]))
  with check (app_private.has_org_role(organization_id, array['owner','admin','manager','agent']::app_role[]));

-- ===========================================================================
-- conversations (operate: owner/admin/manager/agent; read: member+unit)
-- ===========================================================================
alter table public.conversations enable row level security;
create trigger trg_conversations_org_immutable before update on public.conversations
  for each row execute function app_private.forbid_org_change();

create policy conversations_select on public.conversations
  for select using (app_private.is_active_member(organization_id) and app_private.can_access_unit(unit_id));
create policy conversations_write on public.conversations
  for all using (
    app_private.has_org_role(organization_id, array['owner','admin','manager','agent']::app_role[])
    and app_private.can_access_unit(unit_id)
  ) with check (
    app_private.has_org_role(organization_id, array['owner','admin','manager','agent']::app_role[])
    and app_private.can_access_unit(unit_id)
  );

-- ===========================================================================
-- messages (operate: owner/admin/manager/agent; read: member+unit)
-- ===========================================================================
alter table public.messages enable row level security;

create policy messages_select on public.messages
  for select using (app_private.is_active_member(organization_id) and app_private.can_access_unit(unit_id));
create policy messages_insert on public.messages
  for insert with check (
    app_private.has_org_role(organization_id, array['owner','admin','manager','agent']::app_role[])
    and app_private.can_access_unit(unit_id)
  );
-- Mensagens são imutáveis: sem UPDATE/DELETE por usuários.

-- ===========================================================================
-- orders (operate: owner/admin/manager/agent; read: member+unit)
-- ===========================================================================
alter table public.orders enable row level security;
create trigger trg_orders_org_immutable before update on public.orders
  for each row execute function app_private.forbid_org_change();

create policy orders_select on public.orders
  for select using (app_private.is_active_member(organization_id) and app_private.can_access_unit(unit_id));
create policy orders_write on public.orders
  for all using (
    app_private.has_org_role(organization_id, array['owner','admin','manager','agent']::app_role[])
    and app_private.can_access_unit(unit_id)
  ) with check (
    app_private.has_org_role(organization_id, array['owner','admin','manager','agent']::app_role[])
    and app_private.can_access_unit(unit_id)
  );

-- ===========================================================================
-- order_items (operate via ownership do pedido)
-- ===========================================================================
alter table public.order_items enable row level security;

create policy order_items_select on public.order_items
  for select using (app_private.is_active_member(organization_id));
create policy order_items_write on public.order_items
  for all using (app_private.has_org_role(organization_id, array['owner','admin','manager','agent']::app_role[]))
  with check (app_private.has_org_role(organization_id, array['owner','admin','manager','agent']::app_role[]));

-- ===========================================================================
-- agent_settings (manage: owner/admin — comportamento/limites do agente)
-- ===========================================================================
alter table public.agent_settings enable row level security;
create trigger trg_agent_org_immutable before update on public.agent_settings
  for each row execute function app_private.forbid_org_change();

create policy agent_select on public.agent_settings
  for select using (app_private.is_active_member(organization_id));
create policy agent_write on public.agent_settings
  for all using (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]))
  with check (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]));

-- ===========================================================================
-- onboarding_progress (manage: owner/admin; read: member)
-- ===========================================================================
alter table public.onboarding_progress enable row level security;
create trigger trg_onboarding_org_immutable before update on public.onboarding_progress
  for each row execute function app_private.forbid_org_change();

create policy onboarding_select on public.onboarding_progress
  for select using (app_private.is_active_member(organization_id));
create policy onboarding_write on public.onboarding_progress
  for all using (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]))
  with check (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]));

-- ===========================================================================
-- audit_logs (append-only; leitura owner/admin)
-- ===========================================================================
alter table public.audit_logs enable row level security;

create policy audit_select on public.audit_logs
  for select using (app_private.has_org_role(organization_id, array['owner','admin']::app_role[]));
create policy audit_insert on public.audit_logs
  for insert with check (app_private.is_active_member(organization_id));
-- Sem UPDATE/DELETE: trilha imutável.
