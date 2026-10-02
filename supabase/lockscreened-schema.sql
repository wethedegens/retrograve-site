-- supabase/lockscreened-schema.sql
-- DRAFT ONLY: do not apply to another Supabase project.
-- This schema is designed for ONE multi-tenant LockScreened project.
--
-- Security goals:
-- 1. Creator source art stays private.
-- 2. Users cannot self-verify collection claims.
-- 3. Existing flagship assets remain logically protected by application rules.
-- 4. RLS is enabled on every public table.
-- 5. No SECURITY DEFINER helper functions are required.

create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_members (
  studio_id uuid not null references public.studios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (studio_id, user_id)
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  slug text not null unique,
  name text not null,
  source_type text not null check (
    source_type in ('solana_collection','doge_inscription','uploaded_art','demo')
  ),
  source_config jsonb not null default '{}'::jsonb,
  render_mode text not null check (
    render_mode in (
      'layered_traits',
      'curated_composite',
      'remote_image',
      'flat_background_extend'
    )
  ),
  render_profile jsonb not null default '{}'::jsonb,
  flagship boolean not null default false,
  legacy_assets_locked boolean not null default false,
  publish_status text not null default 'draft' check (
    publish_status in ('draft','published','archived')
  ),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collection_claims (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  wallet_address text not null,
  status text not null default 'pending' check (
    status in ('pending','verified','rejected','manual_review')
  ),
  evidence text[] not null default '{}',
  authority_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create table if not exists public.trait_layers (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  trait_type text not null,
  display_name text not null,
  layer_order integer not null,
  is_background boolean not null default false,
  created_at timestamptz not null default now(),
  unique (collection_id, trait_type)
);

create table if not exists public.trait_assets (
  id uuid primary key default gen_random_uuid(),
  layer_id uuid not null references public.trait_layers(id) on delete cascade,
  trait_value text not null,
  storage_bucket text not null,
  storage_path text not null,
  bytes bigint not null default 0 check (bytes >= 0),
  mime_type text,
  created_at timestamptz not null default now(),
  unique (layer_id, trait_value)
);

create table if not exists public.background_packages (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  name text not null,
  source text not null check (
    source in ('legacy_curated','official_creator','lockscreened')
  ),
  locked boolean not null default false,
  publish_status text not null default 'draft' check (
    publish_status in ('draft','published','archived')
  ),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.background_assets (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.background_packages(id) on delete cascade,
  device text not null check (device in ('phone','ipad','desktop','thumb')),
  storage_bucket text not null,
  storage_path text not null,
  bytes bigint not null default 0 check (bytes >= 0),
  mime_type text,
  created_at timestamptz not null default now(),
  unique (package_id, device)
);

create table if not exists public.mint_overrides (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  asset_id text not null,
  storage_bucket text not null,
  storage_path text not null,
  bytes bigint not null default 0 check (bytes >= 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (collection_id, asset_id)
);

create index if not exists studio_members_user_idx
  on public.studio_members (user_id);
create index if not exists collections_studio_idx
  on public.collections (studio_id);
create index if not exists claims_requester_idx
  on public.collection_claims (requested_by);
create index if not exists trait_layers_collection_idx
  on public.trait_layers (collection_id);
create index if not exists background_packages_collection_idx
  on public.background_packages (collection_id);

alter table public.studios enable row level security;
alter table public.studio_members enable row level security;
alter table public.collections enable row level security;
alter table public.collection_claims enable row level security;
alter table public.trait_layers enable row level security;
alter table public.trait_assets enable row level security;
alter table public.background_packages enable row level security;
alter table public.background_assets enable row level security;
alter table public.mint_overrides enable row level security;

-- STUDIOS
create policy "studio members can read studio"
on public.studios for select
to authenticated
using (
  owner_user_id = (select auth.uid())
  or exists (
    select 1 from public.studio_members sm
    where sm.studio_id = studios.id
      and sm.user_id = (select auth.uid())
  )
);

create policy "users create owned studios"
on public.studios for insert
to authenticated
with check (owner_user_id = (select auth.uid()));

create policy "studio owners update studio"
on public.studios for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

-- STUDIO MEMBERS
create policy "studio participants read members"
on public.studio_members for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.studios s
    where s.id = studio_members.studio_id
      and s.owner_user_id = (select auth.uid())
  )
);

create policy "studio owners add members"
on public.studio_members for insert
to authenticated
with check (
  exists (
    select 1 from public.studios s
    where s.id = studio_members.studio_id
      and s.owner_user_id = (select auth.uid())
  )
);

create policy "studio owners update members"
on public.studio_members for update
to authenticated
using (
  exists (
    select 1 from public.studios s
    where s.id = studio_members.studio_id
      and s.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.studios s
    where s.id = studio_members.studio_id
      and s.owner_user_id = (select auth.uid())
  )
);

create policy "studio owners remove members"
on public.studio_members for delete
to authenticated
using (
  exists (
    select 1 from public.studios s
    where s.id = studio_members.studio_id
      and s.owner_user_id = (select auth.uid())
  )
);

-- COLLECTIONS
create policy "published collections are public"
on public.collections for select
to anon, authenticated
using (
  publish_status = 'published'
  or created_by = (select auth.uid())
  or exists (
    select 1 from public.studios s
    where s.id = collections.studio_id
      and s.owner_user_id = (select auth.uid())
  )
  or exists (
    select 1 from public.studio_members sm
    where sm.studio_id = collections.studio_id
      and sm.user_id = (select auth.uid())
  )
);

create policy "studio editors create collections"
on public.collections for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (
    exists (
      select 1 from public.studios s
      where s.id = collections.studio_id
        and s.owner_user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.studio_members sm
      where sm.studio_id = collections.studio_id
        and sm.user_id = (select auth.uid())
        and sm.role in ('owner','editor')
    )
  )
);

create policy "studio editors update collections"
on public.collections for update
to authenticated
using (
  exists (
    select 1 from public.studios s
    where s.id = collections.studio_id
      and s.owner_user_id = (select auth.uid())
  )
  or exists (
    select 1 from public.studio_members sm
    where sm.studio_id = collections.studio_id
      and sm.user_id = (select auth.uid())
      and sm.role in ('owner','editor')
  )
)
with check (
  exists (
    select 1 from public.studios s
    where s.id = collections.studio_id
      and s.owner_user_id = (select auth.uid())
  )
  or exists (
    select 1 from public.studio_members sm
    where sm.studio_id = collections.studio_id
      and sm.user_id = (select auth.uid())
      and sm.role in ('owner','editor')
  )
);

-- CLAIMS
create policy "claim requester reads own claims"
on public.collection_claims for select
to authenticated
using (requested_by = (select auth.uid()));

create policy "users request their own claims"
on public.collection_claims for insert
to authenticated
with check (
  requested_by = (select auth.uid())
  and status = 'pending'
  and verified_at is null
);

-- No authenticated UPDATE policy exists on collection_claims.
-- The server verifies signed authority evidence and updates claim status with a
-- server-only key. Users cannot mark their own claim verified.

-- TRAIT LIBRARY: private to collection studio members.
create policy "studio members read trait layers"
on public.trait_layers for select
to authenticated
using (
  exists (
    select 1
    from public.collections c
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where c.id = trait_layers.collection_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.user_id = (select auth.uid())
      )
  )
);

create policy "studio editors manage trait layers"
on public.trait_layers for all
to authenticated
using (
  exists (
    select 1
    from public.collections c
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where c.id = trait_layers.collection_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
)
with check (
  exists (
    select 1
    from public.collections c
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where c.id = trait_layers.collection_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
);

create policy "studio members read trait assets"
on public.trait_assets for select
to authenticated
using (
  exists (
    select 1
    from public.trait_layers tl
    join public.collections c on c.id = tl.collection_id
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where tl.id = trait_assets.layer_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.user_id = (select auth.uid())
      )
  )
);

create policy "studio editors manage trait assets"
on public.trait_assets for all
to authenticated
using (
  exists (
    select 1
    from public.trait_layers tl
    join public.collections c on c.id = tl.collection_id
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where tl.id = trait_assets.layer_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
)
with check (
  exists (
    select 1
    from public.trait_layers tl
    join public.collections c on c.id = tl.collection_id
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where tl.id = trait_assets.layer_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
);

-- Background metadata can be public once published.
create policy "published background packages are public"
on public.background_packages for select
to anon, authenticated
using (
  publish_status = 'published'
  or exists (
    select 1
    from public.collections c
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where c.id = background_packages.collection_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.user_id = (select auth.uid())
      )
  )
);

create policy "studio editors manage creator background packages"
on public.background_packages for all
to authenticated
using (
  source = 'official_creator'
  and exists (
    select 1
    from public.collections c
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where c.id = background_packages.collection_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
)
with check (
  source = 'official_creator'
  and locked = false
  and exists (
    select 1
    from public.collections c
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where c.id = background_packages.collection_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
);

create policy "published background assets are public"
on public.background_assets for select
to anon, authenticated
using (
  exists (
    select 1 from public.background_packages bp
    where bp.id = background_assets.package_id
      and bp.publish_status = 'published'
  )
  or exists (
    select 1
    from public.background_packages bp
    join public.collections c on c.id = bp.collection_id
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where bp.id = background_assets.package_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.user_id = (select auth.uid())
      )
  )
);

create policy "studio editors manage creator background assets"
on public.background_assets for all
to authenticated
using (
  exists (
    select 1
    from public.background_packages bp
    join public.collections c on c.id = bp.collection_id
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where bp.id = background_assets.package_id
      and bp.source = 'official_creator'
      and bp.locked = false
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
)
with check (
  exists (
    select 1
    from public.background_packages bp
    join public.collections c on c.id = bp.collection_id
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where bp.id = background_assets.package_id
      and bp.source = 'official_creator'
      and bp.locked = false
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
);

-- 1/1 overrides remain private Studio metadata.
create policy "studio members read mint overrides"
on public.mint_overrides for select
to authenticated
using (
  exists (
    select 1
    from public.collections c
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where c.id = mint_overrides.collection_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.user_id = (select auth.uid())
      )
  )
);

create policy "studio editors manage mint overrides"
on public.mint_overrides for all
to authenticated
using (
  exists (
    select 1
    from public.collections c
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where c.id = mint_overrides.collection_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
)
with check (
  exists (
    select 1
    from public.collections c
    join public.studios s on s.id = c.studio_id
    left join public.studio_members sm
      on sm.studio_id = c.studio_id
     and sm.user_id = (select auth.uid())
    where c.id = mint_overrides.collection_id
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
);
