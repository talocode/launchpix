create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  provider_reference text not null,
  credits integer not null,
  metadata_json jsonb,
  created_at timestamptz not null default now(),
  unique (source, provider_reference)
);

create index if not exists idx_credit_transactions_user_id_created_at
on public.credit_transactions(user_id, created_at desc);

alter table public.credit_transactions enable row level security;

drop policy if exists "Users can view own credit transactions" on public.credit_transactions;
create policy "Users can view own credit transactions" on public.credit_transactions
for select using (auth.uid() = user_id);
