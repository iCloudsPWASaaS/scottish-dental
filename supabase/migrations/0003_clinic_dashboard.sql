-- ============================================================================
-- Clinic dashboard support  (schema: sdm)
-- page_views, organisation invite columns, practice bio/image
-- ============================================================================

create table if not exists sdm.page_views (
  id                  uuid primary key default gen_random_uuid(),
  practice_location_id uuid not null references sdm.practice_locations (id) on delete cascade,
  created_at          timestamptz not null default now()
);

create index if not exists idx_page_views_location_created
  on sdm.page_views (practice_location_id, created_at);

alter table sdm.page_views enable row level security;

create policy page_views_select_owner on sdm.page_views
  for select using (
    practice_location_id in (
      select id from sdm.practice_locations where organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );

create policy page_views_insert_anon on sdm.page_views
  for insert with check (
    exists (
      select 1 from sdm.practice_locations l
      where l.id = practice_location_id and l.status = 'published'
    )
  );

-- Team invitations live on organisation_members (pending rows have profile_id null)
alter table sdm.organisation_members
  add column if not exists status       text not null default 'active',
  add column if not exists invited_email citext,
  add column if not exists invited_at   timestamptz,
  add column if not exists invited_by   uuid references sdm.profiles (id) on delete set null;

alter table sdm.organisation_members alter column profile_id drop not null;

drop policy if exists org_members_insert on sdm.organisation_members;
create policy org_members_insert on sdm.organisation_members
  for insert with check (
    profile_id = auth.uid()
    or organisation_id = any(sdm.my_organisation_ids())
    or sdm.is_admin()
  );

create policy org_members_update on sdm.organisation_members
  for update using (
    organisation_id = any(sdm.my_organisation_ids())
    or sdm.is_admin()
    or (profile_id is null and invited_email = (select email from sdm.profiles where id = auth.uid()))
  )
  with check (
    organisation_id = any(sdm.my_organisation_ids())
    or sdm.is_admin()
    or (profile_id is null and invited_email = (select email from sdm.profiles where id = auth.uid()))
  );

create policy org_members_delete on sdm.organisation_members
  for delete using (
    organisation_id = any(sdm.my_organisation_ids())
    or sdm.is_admin()
  );

-- Practice profile content used by the clinic dashboard
alter table sdm.practice_locations
  add column if not exists bio       text,
  add column if not exists image_url text;

-- Weekly hours upsert target (one row per day per location)
alter table sdm.service_availability
  add constraint service_availability_location_day_key
  unique (practice_location_id, day_of_week);
