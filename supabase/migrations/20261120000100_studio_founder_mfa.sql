begin;

create schema if not exists lockscreened_auth;
revoke all on schema lockscreened_auth from public, anon, authenticated;

create table lockscreened_auth.founder_mfa_settings (
  singleton boolean primary key default true check (singleton),
  required boolean not null default false
);
insert into lockscreened_auth.founder_mfa_settings default values;
revoke all on lockscreened_auth.founder_mfa_settings from public, anon, authenticated;

-- Install with enforcement off so founders can enroll before the rollout.
create function public.studio_founder_mfa_allowed()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select auth.uid() is not null and (
    coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    or exists (
      select 1 from lockscreened_auth.founder_mfa_settings
      where singleton and not required
    )
  );
$$;
revoke all on function public.studio_founder_mfa_allowed() from public, anon;
grant execute on function public.studio_founder_mfa_allowed() to authenticated;

create function lockscreened_auth.guard_founder_lifecycle()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  needs_mfa boolean;
begin
  if tg_op = 'INSERT' then
    needs_mfa := new.publish_status is distinct from 'draft';
  elsif tg_op = 'UPDATE' then
    needs_mfa := new.publish_status is distinct from old.publish_status;
  else
    needs_mfa := true;
  end if;

  -- Server-only publishers using the service role enforce the same check
  -- against the initiating founder token before any privileged write.
  if coalesce(auth.role(), '') = 'authenticated' and needs_mfa
     and not public.studio_founder_mfa_allowed() then
    raise exception using errcode = '42501',
      message = 'Verify your founder authenticator before changing publication state.';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function lockscreened_auth.guard_founder_lifecycle() from public, anon, authenticated;

create trigger lockscreened_founder_mfa_collections
before insert or update of publish_status or delete on public.collections
for each row execute function lockscreened_auth.guard_founder_lifecycle();

create trigger lockscreened_founder_mfa_backgrounds
before insert or update of publish_status or delete on public.background_packages
for each row execute function lockscreened_auth.guard_founder_lifecycle();

commit;
