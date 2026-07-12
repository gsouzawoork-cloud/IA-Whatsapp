-- 0002_profiles_and_organizations.sql
-- Perfis (1:1 com auth.users) e organizações (o "tenant" do SaaS).

-- Gatilho utilitário para manter updated_at coerente.
create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: dados públicos mínimos do usuário autenticado.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  locale text not null default 'pt-BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function app_private.set_updated_at();

-- Cria o profile automaticamente quando um usuário se cadastra no Auth.
create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_user();

-- ---------------------------------------------------------------------------
-- organizations: a empresa cliente do SaaS.
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  legal_name text,
  slug citext not null unique,
  business_type business_type not null default 'other',
  document text,
  phone text,
  email citext,
  timezone text not null default 'America/Sao_Paulo',
  locale text not null default 'pt-BR',
  onboarding_status onboarding_status not null default 'pending',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_display_name_len check (char_length(display_name) between 1 and 120),
  constraint organizations_slug_len check (char_length(slug) between 2 and 63)
);

create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row execute function app_private.set_updated_at();
