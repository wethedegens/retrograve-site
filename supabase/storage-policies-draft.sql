-- supabase/storage-policies-draft.sql
-- Apply only after the dedicated LockScreened project/buckets exist.
-- Bucket creation itself should use Supabase Storage API/dashboard, not direct
-- writes to storage metadata.

-- PRIVATE SOURCE ART
-- Expected object prefix:
-- <studio-id>/collections/<collection-id>/...

create policy "studio members read private creator source"
on storage.objects for select
to authenticated
using (
  bucket_id = 'creator-source-private'
  and exists (
    select 1
    from public.studios s
    left join public.studio_members sm
      on sm.studio_id = s.id
     and sm.user_id = (select auth.uid())
    where s.id::text = (storage.foldername(name))[1]
      and (
        s.owner_user_id = (select auth.uid())
        or sm.user_id = (select auth.uid())
      )
  )
);

create policy "studio editors upload private creator source"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'creator-source-private'
  and exists (
    select 1
    from public.studios s
    left join public.studio_members sm
      on sm.studio_id = s.id
     and sm.user_id = (select auth.uid())
    where s.id::text = (storage.foldername(name))[1]
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
);

-- UPDATE + SELECT are required if Studio later supports Storage upsert.
create policy "studio editors update private creator source"
on storage.objects for update
to authenticated
using (
  bucket_id = 'creator-source-private'
  and exists (
    select 1
    from public.studios s
    left join public.studio_members sm
      on sm.studio_id = s.id
     and sm.user_id = (select auth.uid())
    where s.id::text = (storage.foldername(name))[1]
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
)
with check (
  bucket_id = 'creator-source-private'
  and exists (
    select 1
    from public.studios s
    left join public.studio_members sm
      on sm.studio_id = s.id
     and sm.user_id = (select auth.uid())
    where s.id::text = (storage.foldername(name))[1]
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
);

create policy "studio editors delete private creator source"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'creator-source-private'
  and exists (
    select 1
    from public.studios s
    left join public.studio_members sm
      on sm.studio_id = s.id
     and sm.user_id = (select auth.uid())
    where s.id::text = (storage.foldername(name))[1]
      and (
        s.owner_user_id = (select auth.uid())
        or sm.role in ('owner','editor')
      )
  )
);

-- PUBLIC PUBLISHED ART
-- The bucket itself can be configured public for efficient collector delivery.
-- Upload/update/delete remains limited to verified Studio members through
-- application/database authorization. Do not put original trait/source files
-- in this bucket.
