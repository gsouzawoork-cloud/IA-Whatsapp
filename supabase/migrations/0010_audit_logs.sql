-- 0010_audit_logs.sql
-- Trilha de auditoria. NUNCA registra segredos, tokens, senhas, conteúdo
-- completo de mensagens, cartão, documento completo ou cookies. `metadata` é
-- sempre um JSON já sanitizado pela aplicação.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  unit_id uuid references public.units (id) on delete set null,
  actor_user_id uuid references auth.users (id) on delete set null,
  actor_type actor_type not null default 'user',
  action text not null,
  entity_type text not null,
  entity_id uuid,
  result audit_result not null default 'success',
  metadata jsonb not null default '{}'::jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create index idx_audit_org_created on public.audit_logs (organization_id, created_at desc);
create index idx_audit_entity on public.audit_logs (entity_type, entity_id);
