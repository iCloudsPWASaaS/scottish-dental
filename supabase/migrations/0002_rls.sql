-- ============================================================================
-- Row Level Security + helper functions  (schema: sdm)
-- ============================================================================

-- Helpers are SECURITY DEFINER so they can read their source tables without
-- triggering infinite RLS recursion when called from policies on those tables.

-- Helper: current user's role
create or replace function sdm.current_role()
returns sdm.sdm_role
language sql
stable
security definer
set search_path = sdm, public
as $$
  select role from sdm.profiles where id = auth.uid()
$$;

-- Helper: is current user a privileged operator
create or replace function sdm.is_admin()
returns boolean
language sql
stable
security definer
set search_path = sdm, public
as $$
  select coalesce((select role from sdm.profiles where id = auth.uid()) in ('admin', 'super_admin'), false)
$$;

-- Helper: is current user business development staff
create or replace function sdm.is_bd()
returns boolean
language sql
stable
security definer
set search_path = sdm, public
as $$
  select coalesce(
    (select role from sdm.profiles where id = auth.uid()) in ('business_development', 'admin', 'super_admin'),
    false
  )
$$;

-- Helper: organisations the current user belongs to
create or replace function sdm.my_organisation_ids()
returns uuid[]
language sql
stable
security definer
set search_path = sdm, public
as $$
  select coalesce(
    array(select organisation_id from sdm.organisation_members where profile_id = auth.uid()),
    '{}'::uuid[]
  )
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS on every table
-- ---------------------------------------------------------------------------
alter table sdm.profiles             enable row level security;
alter table sdm.organisations        enable row level security;
alter table sdm.organisation_members enable row level security;
alter table sdm.prospects            enable row level security;
alter table sdm.prospect_sources     enable row level security;
alter table sdm.outreach_activities  enable row level security;
alter table sdm.suppressions         enable row level security;
alter table sdm.invitations          enable row level security;
alter table sdm.practice_locations   enable row level security;
alter table sdm.clinicians           enable row level security;
alter table sdm.treatments           enable row level security;
alter table sdm.practice_treatments  enable row level security;
alter table sdm.prices               enable row level security;
alter table sdm.service_availability enable row level security;
alter table sdm.enquiries            enable row level security;
alter table sdm.bookings             enable row level security;
alter table sdm.subscriptions        enable row level security;
alter table sdm.payments             enable row level security;
alter table sdm.reviews              enable row level security;
alter table sdm.content_pages        enable row level security;
alter table sdm.audit_events         enable row level security;

-- ===========================================================================
-- PROFILES
-- ===========================================================================
create policy profiles_select_own on sdm.profiles
  for select using (auth.uid() = id or sdm.is_admin());
create policy profiles_update_own on sdm.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from sdm.profiles where id = auth.uid()));

-- ===========================================================================
-- ORGANISATIONS
-- ===========================================================================
create policy organisations_select_member on sdm.organisations
  for select using (
    owner_id = auth.uid()
    or auth.uid() = any(sdm.my_organisation_ids())
    or sdm.is_admin()
  );
create policy organisations_insert_member on sdm.organisations
  for insert with check (owner_id = auth.uid() or sdm.is_admin());
create policy organisations_update_member on sdm.organisations
  for update using (
    owner_id = auth.uid()
    or auth.uid() = any(sdm.my_organisation_ids())
    or sdm.is_admin()
  );

create policy org_members_select on sdm.organisation_members
  for select using (
    profile_id = auth.uid()
    or organisation_id = any(sdm.my_organisation_ids())
    or sdm.is_admin()
  );
create policy org_members_insert on sdm.organisation_members
  for insert with check (profile_id = auth.uid() or sdm.is_admin());

-- ===========================================================================
-- PRIVATE CRM - operators only; anon/authenticated get nothing
-- ===========================================================================
create policy prospects_select_bd on sdm.prospects
  for select using (sdm.is_bd());
create policy prospects_insert_bd on sdm.prospects
  for insert with check (sdm.is_bd());
create policy prospects_update_bd on sdm.prospects
  for update using (sdm.is_bd());

create policy prospect_sources_select_bd on sdm.prospect_sources
  for select using (sdm.is_bd());
create policy prospect_sources_insert_bd on sdm.prospect_sources
  for insert with check (sdm.is_bd());

create policy outreach_select_bd on sdm.outreach_activities
  for select using (sdm.is_bd());
create policy outreach_insert_bd on sdm.outreach_activities
  for insert with check (sdm.is_bd());

create policy suppressions_select_bd on sdm.suppressions
  for select using (sdm.is_bd());
create policy suppressions_insert_bd on sdm.suppressions
  for insert with check (sdm.is_bd());

create policy invitations_select_bd on sdm.invitations
  for select using (sdm.is_bd());
create policy invitations_insert_bd on sdm.invitations
  for insert with check (sdm.is_bd());
create policy invitations_update_bd on sdm.invitations
  for update using (sdm.is_bd());

-- ===========================================================================
-- PUBLIC MARKETPLACE
-- ===========================================================================
create policy locations_select_published on sdm.practice_locations
  for select using (
    status = 'published'
    or organisation_id = any(sdm.my_organisation_ids())
    or sdm.is_admin()
  );
create policy locations_insert_owner on sdm.practice_locations
  for insert with check (
    organisation_id = any(sdm.my_organisation_ids())
    or sdm.is_admin()
  );
create policy locations_update_owner on sdm.practice_locations
  for update using (
    organisation_id = any(sdm.my_organisation_ids())
    or sdm.is_admin()
  );

create policy clinicians_select_public on sdm.clinicians
  for select using (
    exists (
      select 1 from sdm.practice_locations l
      where l.id = practice_location_id and l.status = 'published'
    )
    or practice_location_id in (
      select id from sdm.practice_locations where organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );
create policy clinicians_write_owner on sdm.clinicians
  for all using (
    exists (
      select 1 from sdm.practice_locations l
      where l.id = practice_location_id
        and l.organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );

create policy treatments_select_public on sdm.treatments
  for select using (true);
create policy treatments_write_admin on sdm.treatments
  for all using (sdm.is_admin());

create policy practice_treatments_select_public on sdm.practice_treatments
  for select using (
    exists (
      select 1 from sdm.practice_locations l
      where l.id = practice_location_id and l.status = 'published'
    )
    or practice_location_id in (
      select id from sdm.practice_locations where organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );
create policy practice_treatments_write_owner on sdm.practice_treatments
  for all using (
    exists (
      select 1 from sdm.practice_locations l
      where l.id = practice_location_id
        and l.organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );

create policy prices_select_public on sdm.prices
  for select using (
    exists (
      select 1 from sdm.practice_locations l
      where l.id = practice_location_id and l.status = 'published'
    )
    or practice_location_id in (
      select id from sdm.practice_locations where organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );
create policy prices_write_owner on sdm.prices
  for all using (
    exists (
      select 1 from sdm.practice_locations l
      where l.id = practice_location_id
        and l.organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );

create policy availability_select_public on sdm.service_availability
  for select using (true);
create policy availability_write_owner on sdm.service_availability
  for all using (
    exists (
      select 1 from sdm.practice_locations l
      where l.id = practice_location_id
        and l.organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );

create policy enquiries_insert_anon on sdm.enquiries
  for insert with check (true);
create policy enquiries_select_owner on sdm.enquiries
  for select using (
    practice_location_id in (
      select id from sdm.practice_locations where organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );
create policy enquiries_update_owner on sdm.enquiries
  for update using (
    practice_location_id in (
      select id from sdm.practice_locations where organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );

create policy bookings_select_owner on sdm.bookings
  for select using (
    practice_location_id in (
      select id from sdm.practice_locations where organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );
create policy bookings_write_owner on sdm.bookings
  for all using (
    practice_location_id in (
      select id from sdm.practice_locations where organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );

-- ===========================================================================
-- COMMERCIAL
-- ===========================================================================
create policy subscriptions_select_owner on sdm.subscriptions
  for select using (
    organisation_id = any(sdm.my_organisation_ids()) or sdm.is_admin()
  );
create policy payments_select_owner on sdm.payments
  for select using (
    organisation_id = any(sdm.my_organisation_ids()) or sdm.is_admin()
  );

-- ===========================================================================
-- MODERATION / CONTENT / AUDIT
-- ===========================================================================
create policy reviews_select_approved on sdm.reviews
  for select using (
    status = 'approved'
    or practice_location_id in (
      select id from sdm.practice_locations where organisation_id = any(sdm.my_organisation_ids())
    )
    or sdm.is_admin()
  );
create policy reviews_insert_anon on sdm.reviews
  for insert with check (status = 'pending');

create policy content_pages_select_published on sdm.content_pages
  for select using (is_published = true or sdm.is_admin());
create policy content_pages_write_admin on sdm.content_pages
  for all using (sdm.is_admin());

create policy audit_select_admin on sdm.audit_events
  for select using (sdm.is_admin());

-- ===========================================================================
-- Trigger: keep updated_at fresh
-- ===========================================================================
create or replace function sdm.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','organisations','prospects','practice_locations',
    'clinicians','treatments','enquiries','content_pages'
  ]
  loop
    execute format('drop trigger if exists trg_%I_updated_at on sdm.%I', t, t);
    execute format(
      'create trigger trg_%I_updated_at before update on sdm.%I for each row execute function sdm.set_updated_at()',
      t, t
    );
  end loop;
end $$;

-- ===========================================================================
-- Auto-create a profile when a user signs up
-- ===========================================================================
create or replace function sdm.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = sdm, public, auth
as $$
begin
  insert into sdm.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::sdm.sdm_role, 'patient'::sdm.sdm_role)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function sdm.handle_new_user();

-- ===========================================================================
-- Storage bucket (replaces any 'justeat' bucket)
-- ===========================================================================
insert into storage.buckets (id, name, public)
values ('sdm-media', 'sdm-media', true)
on conflict (id) do nothing;

create policy storage_media_public_read on storage.objects
  for select using (bucket_id = 'sdm-media');
create policy storage_media_owner_write on storage.objects
  for insert with check (
    bucket_id = 'sdm-media'
    and (
      sdm.is_admin()
      or auth.uid() = any(sdm.my_organisation_ids())
    )
  );
