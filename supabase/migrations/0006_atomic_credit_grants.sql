create or replace function public.grant_credit_pack_atomic(
  p_user_id uuid,
  p_source text,
  p_provider_reference text,
  p_credits integer,
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.credit_transactions (user_id, source, provider_reference, credits, metadata_json)
  values (p_user_id, p_source, p_provider_reference, p_credits, p_metadata);

  update public.subscriptions
  set
    plan = 'credits',
    status = 'active',
    credits_remaining = credits_remaining + p_credits,
    provider = p_source,
    provider_reference = p_provider_reference,
    last_payment_at = now(),
    updated_at = now()
  where user_id = p_user_id;

  return true;
exception
  when unique_violation then
    return false;
end;
$$;
