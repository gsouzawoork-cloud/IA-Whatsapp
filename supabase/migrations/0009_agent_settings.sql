-- 0009_agent_settings.sql
-- Configurações do agente (comportamento + capacidades PERMITIDAS).
-- As capacidades aqui são apenas o que o agente pode SOLICITAR; a execução real
-- é sempre validada pelo backend/ferramentas determinísticas. Ações críticas
-- (alterar preço, aplicar desconto, confirmar pagamento, reembolso, cancelar,
-- alterar taxa de entrega) permanecem fora do alcance do agente por design.

create table public.agent_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  unit_id uuid references public.units (id) on delete cascade,
  agent_name text not null default 'Assistente',
  introduction_message text not null default '',
  tone text not null default 'friendly',
  formality_level smallint not null default 2 check (formality_level between 1 and 5),
  emoji_usage text not null default 'moderate',
  automatic_service_enabled boolean not null default true,
  human_handoff_enabled boolean not null default true,
  can_search_catalog boolean not null default true,
  can_check_availability boolean not null default true,
  can_quote_delivery boolean not null default true,
  can_create_order_draft boolean not null default true,
  can_inform_order_status boolean not null default true,
  can_suggest_alternatives boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Uma configuração por (organização, unidade). unit_id nulo = padrão da org.
  constraint agent_settings_unique unique (organization_id, unit_id)
);

create trigger trg_agent_settings_updated_at
  before update on public.agent_settings
  for each row execute function app_private.set_updated_at();

-- ---------------------------------------------------------------------------
-- onboarding_progress: passo atual e passos concluídos (retomável).
-- ---------------------------------------------------------------------------
create table public.onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  current_step text not null default 'empresa',
  completed_steps text[] not null default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_onboarding_updated_at
  before update on public.onboarding_progress
  for each row execute function app_private.set_updated_at();
