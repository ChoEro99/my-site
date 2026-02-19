-- Enable required extension
create extension if not exists "pgcrypto";

-- Credits table
create table if not exists public.generation_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  credits integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Generated tests table
create table if not exists public.generated_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_json jsonb not null,
  paid boolean not null default true,
  report_downloads_remaining integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generated_tests_user_created_idx
  on public.generated_tests(user_id, created_at desc);

-- RLS
alter table public.generation_credits enable row level security;
alter table public.generated_tests enable row level security;

drop policy if exists "credits_select_own" on public.generation_credits;
create policy "credits_select_own"
on public.generation_credits
for select
using (auth.uid() = user_id);

drop policy if exists "credits_upsert_own" on public.generation_credits;
create policy "credits_upsert_own"
on public.generation_credits
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "generated_select_own" on public.generated_tests;
create policy "generated_select_own"
on public.generated_tests
for select
using (auth.uid() = user_id);

drop policy if exists "generated_insert_own" on public.generated_tests;
create policy "generated_insert_own"
on public.generated_tests
for insert
with check (auth.uid() = user_id);

drop policy if exists "generated_update_own" on public.generated_tests;
create policy "generated_update_own"
on public.generated_tests
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
