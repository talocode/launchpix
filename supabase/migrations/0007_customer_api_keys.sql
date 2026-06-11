create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Default',
  key_prefix text not null,
  key_hash text not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_api_keys_active_prefix
on public.api_keys(key_prefix)
where revoked_at is null;

create index if not exists idx_api_keys_user_id_created_at
on public.api_keys(user_id, created_at desc);

alter table public.api_keys enable row level security;

create policy "Users can view own api keys" on public.api_keys
for select using (auth.uid() = user_id);

create policy "Users can insert own api keys" on public.api_keys
for insert with check (auth.uid() = user_id);

create policy "Users can update own api keys" on public.api_keys
for update using (auth.uid() = user_id);