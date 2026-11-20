begin;

-- Match the signed authentication method in the current session, not the
-- presence of a linked wallet identity on the account.
create function public.studio_wallet_session()
returns boolean
language sql stable
set search_path = ''
as $$
  select auth.uid() is not null and
    coalesce((auth.jwt() -> 'amr') @> '[{"method":"web3"}]'::jsonb, false);
$$;
revoke all on function public.studio_wallet_session() from public, anon;
grant execute on function public.studio_wallet_session() to authenticated;

create or replace function public.studio_founder_mfa_allowed()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select public.studio_wallet_session() and (
    exists (
      select 1 from lockscreened_auth.founder_mfa_settings
      where singleton and not required
    )
    or (
      coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
      and exists (
        select 1 from auth.users
        where id = auth.uid() and nullif(email, '') is not null
          and email_confirmed_at is not null
      )
    )
  );
$$;

-- Combine with existing policies. Anonymous public access and server service
-- credentials do not use this authenticated-role policy.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'studios', 'studio_members', 'collections', 'collection_claims',
    'background_packages', 'background_assets', 'background_source_assets',
    'trait_assets', 'trait_layers', 'mint_overrides', 'published_mint_overrides',
    'published_trait_assets', 'collection_validation_runs', 'studio_audit_events',
    'studio_action_rate_limits'
  ] loop
    execute format(
      'create policy studio_wallet_session_required on public.%I as restrictive
       for all to authenticated using ((select public.studio_wallet_session()))
       with check ((select public.studio_wallet_session()))', table_name
    );
  end loop;
end;
$$;

create policy studio_wallet_session_required on storage.objects as restrictive
for all to authenticated
using (bucket_id not in ('creator-source-private', 'published-public') or (select public.studio_wallet_session()))
with check (bucket_id not in ('creator-source-private', 'published-public') or (select public.studio_wallet_session()));

commit;
