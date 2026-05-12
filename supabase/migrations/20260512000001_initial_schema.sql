-- Customer Agent Wizard - Initial schema
-- Revenue Hub Latam

create extension if not exists "uuid-ossp";

-- =========================================
-- Tables
-- =========================================

create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  full_name text,
  role text not null default 'member',
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  industry text,
  website_url text,
  primary_product text,
  channels jsonb not null default '[]'::jsonb,
  status text not null default 'in_progress',
  notion_id text,
  hubspot_portal_id text,
  hubspot_oauth_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wizard_sessions (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  current_step int not null default 1,
  form_data jsonb not null default '{}'::jsonb,
  blueprint jsonb,
  blueprint_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generated_files (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.wizard_sessions(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  prompt_template_id text not null,
  filename text not null,
  output_format text not null,
  storage_path text not null,
  preview text,
  status text not null default 'pending',
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompt_templates (
  id text primary key,
  output_format text not null,
  filename_pattern text,
  version int not null default 1,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generation_logs (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.wizard_sessions(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  prompt_template_id text,
  model text,
  input_tokens int,
  output_tokens int,
  duration_ms int,
  status text not null default 'success',
  error text,
  created_at timestamptz not null default now()
);

create table if not exists public.validation_checks (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  check_type text not null,
  status text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

-- =========================================
-- Indexes
-- =========================================

create index if not exists idx_clients_team on public.clients(team_id);
create index if not exists idx_sessions_client on public.wizard_sessions(client_id);
create index if not exists idx_files_session on public.generated_files(session_id);
create unique index if not exists uniq_files_session_template
  on public.generated_files(session_id, prompt_template_id);
create index if not exists idx_logs_session on public.generation_logs(session_id);
create index if not exists idx_checks_client on public.validation_checks(client_id);

-- =========================================
-- Updated_at trigger
-- =========================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_clients_updated on public.clients;
create trigger trg_clients_updated before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists trg_sessions_updated on public.wizard_sessions;
create trigger trg_sessions_updated before update on public.wizard_sessions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_files_updated on public.generated_files;
create trigger trg_files_updated before update on public.generated_files
  for each row execute function public.set_updated_at();

drop trigger if exists trg_prompts_updated on public.prompt_templates;
create trigger trg_prompts_updated before update on public.prompt_templates
  for each row execute function public.set_updated_at();

-- =========================================
-- Helper: current user team
-- =========================================

create or replace function public.current_team_id()
returns uuid as $$
  select team_id from public.user_profiles where id = auth.uid();
$$ language sql stable security definer;

-- =========================================
-- RLS
-- =========================================

alter table public.teams enable row level security;
alter table public.user_profiles enable row level security;
alter table public.clients enable row level security;
alter table public.wizard_sessions enable row level security;
alter table public.generated_files enable row level security;
alter table public.prompt_templates enable row level security;
alter table public.generation_logs enable row level security;
alter table public.validation_checks enable row level security;

-- Teams: members can read their team
drop policy if exists "teams_select_member" on public.teams;
create policy "teams_select_member" on public.teams
  for select using (id = public.current_team_id());

-- User profiles
drop policy if exists "profiles_select_self_or_team" on public.user_profiles;
create policy "profiles_select_self_or_team" on public.user_profiles
  for select using (id = auth.uid() or team_id = public.current_team_id());

drop policy if exists "profiles_update_self" on public.user_profiles;
create policy "profiles_update_self" on public.user_profiles
  for update using (id = auth.uid());

drop policy if exists "profiles_insert_self" on public.user_profiles;
create policy "profiles_insert_self" on public.user_profiles
  for insert with check (id = auth.uid());

-- Clients
drop policy if exists "clients_team_all" on public.clients;
create policy "clients_team_all" on public.clients
  for all using (team_id = public.current_team_id())
  with check (team_id = public.current_team_id());

-- Wizard sessions
drop policy if exists "sessions_team_all" on public.wizard_sessions;
create policy "sessions_team_all" on public.wizard_sessions
  for all using (team_id = public.current_team_id())
  with check (team_id = public.current_team_id());

-- Generated files
drop policy if exists "files_team_all" on public.generated_files;
create policy "files_team_all" on public.generated_files
  for all using (team_id = public.current_team_id())
  with check (team_id = public.current_team_id());

-- Prompt templates: read for all authenticated
drop policy if exists "prompts_read_all" on public.prompt_templates;
create policy "prompts_read_all" on public.prompt_templates
  for select using (auth.role() = 'authenticated');

-- Generation logs
drop policy if exists "logs_team_all" on public.generation_logs;
create policy "logs_team_all" on public.generation_logs
  for all using (team_id = public.current_team_id())
  with check (team_id = public.current_team_id());

-- Validation checks
drop policy if exists "checks_team_all" on public.validation_checks;
create policy "checks_team_all" on public.validation_checks
  for all using (team_id = public.current_team_id())
  with check (team_id = public.current_team_id());

-- =========================================
-- Storage bucket for generated files
-- =========================================

insert into storage.buckets (id, name, public)
values ('generated-files', 'generated-files', false)
on conflict (id) do nothing;

drop policy if exists "generated_files_team_read" on storage.objects;
create policy "generated_files_team_read" on storage.objects
  for select using (
    bucket_id = 'generated-files'
    and (storage.foldername(name))[1] = 'team_' || public.current_team_id()::text
  );

drop policy if exists "generated_files_team_write" on storage.objects;
create policy "generated_files_team_write" on storage.objects
  for insert with check (
    bucket_id = 'generated-files'
    and (storage.foldername(name))[1] = 'team_' || public.current_team_id()::text
  );

drop policy if exists "generated_files_team_update" on storage.objects;
create policy "generated_files_team_update" on storage.objects
  for update using (
    bucket_id = 'generated-files'
    and (storage.foldername(name))[1] = 'team_' || public.current_team_id()::text
  );

drop policy if exists "generated_files_team_delete" on storage.objects;
create policy "generated_files_team_delete" on storage.objects
  for delete using (
    bucket_id = 'generated-files'
    and (storage.foldername(name))[1] = 'team_' || public.current_team_id()::text
  );
