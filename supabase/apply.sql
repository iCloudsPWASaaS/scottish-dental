-- ============================================================================
-- Scottish Dental Marketplace - ONE-SHOT SETUP  (schema: sdm)
-- Paste this entire file into the Supabase SQL Editor and run it.
-- Order: 0001 schema -> 0002 RLS -> seed
-- ============================================================================

-- ===== migrations\0001_init.sql =====
-- ============================================================================
-- Scottish Dental Marketplace - initial schema
-- Dedicated Postgres schema: sdm  (NOT public, NOT justeat)
-- Prefix on tables: sdm_ (convention)
-- ============================================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- Schema + access
-- ---------------------------------------------------------------------------
create schema if not exists sdm;

grant usage on schema sdm to anon, authenticated, service_role, postgres;

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
do $$ begin
  create type sdm.sdm_role as enum (
    'patient',
    'practice_owner',
    'practice_member',
    'business_development',
    'admin',
    'super_admin'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists sdm.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  email           citext not null,
  full_name       text,
  role            sdm.sdm_role not null default 'patient',
  phone           text,
  organisation_id uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Organisations (multi-location parent companies)
-- ---------------------------------------------------------------------------
create table if not exists sdm.organisations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid references sdm.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table sdm.profiles
  drop constraint if exists sdm_profiles_organisation_fk;
alter table sdm.profiles
  add constraint sdm_profiles_organisation_fk
  foreign key (organisation_id) references sdm.organisations (id) on delete set null;

create table if not exists sdm.organisation_members (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references sdm.organisations (id) on delete cascade,
  profile_id      uuid not null references sdm.profiles (id) on delete cascade,
  membership_role text not null default 'member',
  created_at      timestamptz not null default now(),
  unique (organisation_id, profile_id)
);

-- ---------------------------------------------------------------------------
-- PRIVATE ACQUISITION CRM (never publicly readable)
-- ---------------------------------------------------------------------------
create table if not exists sdm.prospects (
  id                 uuid primary key default gen_random_uuid(),
  practice_name      text not null,
  address            text,
  postcode           text,
  local_authority    text,
  nhs_board          text,
  website            text,
  general_email      citext,
  general_phone      text,
  named_contact      text,
  contact_preferences text,
  source_url         text,
  source_type        text,
  captured_at        timestamptz,
  researcher         text,
  last_verified_at   timestamptz,
  nhs_private_status text not null default 'unverified',
  services           text[] not null default '{}',
  region             text,
  organisation_group text,
  assigned_manager_id uuid references sdm.profiles (id) on delete set null,
  status             text not null default 'identified',
  attempts           integer not null default 0,
  notes              text,
  next_contact_date  timestamptz,
  response           text,
  marketing_basis    text,
  opt_out            boolean not null default false,
  do_not_contact     boolean not null default false,
  archived           boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists sdm.prospect_sources (
  id          uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references sdm.prospects (id) on delete cascade,
  source_url  text not null,
  source_type text,
  captured_at timestamptz not null default now(),
  researcher  text
);

create table if not exists sdm.outreach_activities (
  id            uuid primary key default gen_random_uuid(),
  prospect_id   uuid not null references sdm.prospects (id) on delete cascade,
  activity_type text not null,
  status        text not null default 'sent',
  notes         text,
  created_by    uuid references sdm.profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);

create table if not exists sdm.suppressions (
  id            uuid primary key default gen_random_uuid(),
  email         citext unique,
  phone         text,
  practice_name text,
  reason        text,
  created_at    timestamptz not null default now()
);

create table if not exists sdm.invitations (
  id              uuid primary key default gen_random_uuid(),
  prospect_id     uuid references sdm.prospects (id) on delete set null,
  organisation_id uuid references sdm.organisations (id) on delete set null,
  email           citext not null,
  token           text not null unique,
  status          text not null default 'pending',
  expires_at      timestamptz,
  accepted_at     timestamptz,
  created_by      uuid references sdm.profiles (id) on delete set null,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PUBLIC LIVE MARKETPLACE
-- ---------------------------------------------------------------------------
create table if not exists sdm.practice_locations (
  id                 uuid primary key default gen_random_uuid(),
  organisation_id    uuid references sdm.organisations (id) on delete cascade,
  name               text not null,
  slug               text not null unique,
  address            text not null,
  postcode           text not null,
  local_authority    text,
  nhs_board          text,
  latitude           numeric,
  longitude          numeric,
  phone              text,
  email              citext,
  website            text,
  nhs_private        text not null default 'private',
  accepting_new_nhs  boolean not null default false,
  opening_hours      jsonb not null default '{}'::jsonb,
  facilities         text[] not null default '{}',
  languages          text[] not null default '{}',
  accessibility      text[] not null default '{}',
  sedation_options   text[] not null default '{}',
  appointment_mode   text not null default 'enquiry_only',
  status             text not null default 'pending',
  verified_at        timestamptz,
  published_at       timestamptz,
  last_confirmed_at  timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists sdm.clinicians (
  id                  uuid primary key default gen_random_uuid(),
  practice_location_id uuid not null references sdm.practice_locations (id) on delete cascade,
  full_name           text not null,
  gdc_number          text,
  bio                 text,
  specialties         text[] not null default '{}',
  is_verified         boolean not null default false,
  created_at          timestamptz not null default now()
);

create table if not exists sdm.treatments (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  category          text not null,
  description       text,
  limitations       text[] not null default '{}',
  is_patient_facing boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists sdm.practice_treatments (
  id                  uuid primary key default gen_random_uuid(),
  practice_location_id uuid not null references sdm.practice_locations (id) on delete cascade,
  treatment_id        uuid not null references sdm.treatments (id) on delete cascade,
  is_offered          boolean not null default true,
  nhs_available       boolean not null default false,
  private_available   boolean not null default true,
  unique (practice_location_id, treatment_id)
);

create table if not exists sdm.prices (
  id                  uuid primary key default gen_random_uuid(),
  practice_location_id uuid not null references sdm.practice_locations (id) on delete cascade,
  treatment_id        uuid references sdm.treatments (id) on delete set null,
  label               text not null,
  amount              numeric,
  currency            text not null default 'GBP',
  price_type          text not null default 'from',
  conditions          text,
  nhs                 boolean not null default false,
  confirmed_at        timestamptz,
  created_at          timestamptz not null default now()
);

create table if not exists sdm.service_availability (
  id                  uuid primary key default gen_random_uuid(),
  practice_location_id uuid not null references sdm.practice_locations (id) on delete cascade,
  day_of_week         integer not null check (day_of_week between 0 and 6),
  opens_at            time,
  closes_at           time,
  is_closed           boolean not null default false
);

create table if not exists sdm.enquiries (
  id                  uuid primary key default gen_random_uuid(),
  practice_location_id uuid not null references sdm.practice_locations (id) on delete cascade,
  patient_name        text not null,
  patient_email       citext,
  patient_phone       text,
  preferred_contact   text not null default 'email',
  treatment_id        uuid references sdm.treatments (id) on delete set null,
  message             text,
  status              text not null default 'received',
  consent_given       boolean not null default false,
  ip_hash             text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists sdm.bookings (
  id                  uuid primary key default gen_random_uuid(),
  enquiry_id          uuid references sdm.enquiries (id) on delete set null,
  practice_location_id uuid not null references sdm.practice_locations (id) on delete cascade,
  patient_name        text,
  scheduled_at        timestamptz,
  status              text not null default 'pending',
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- COMMERCIAL
-- ---------------------------------------------------------------------------
create table if not exists sdm.subscriptions (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references sdm.organisations (id) on delete cascade,
  plan            text not null default 'free',
  status          text not null default 'trialing',
  starts_at       timestamptz not null default now(),
  ends_at         timestamptz,
  created_at      timestamptz not null default now()
);

create table if not exists sdm.payments (
  id              uuid primary key default gen_random_uuid(),
  subscription_id uuid references sdm.subscriptions (id) on delete set null,
  organisation_id uuid references sdm.organisations (id) on delete set null,
  amount          numeric not null,
  currency        text not null default 'GBP',
  status          text not null default 'pending',
  provider        text,
  provider_ref    text,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- MODERATION / CONTENT / AUDIT
-- ---------------------------------------------------------------------------
create table if not exists sdm.reviews (
  id                  uuid primary key default gen_random_uuid(),
  practice_location_id uuid not null references sdm.practice_locations (id) on delete cascade,
  author_name         text,
  rating              integer check (rating between 1 and 5),
  body                text,
  status              text not null default 'pending',
  created_at          timestamptz not null default now()
);

create table if not exists sdm.content_pages (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  body             text,
  meta_description text,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists sdm.audit_events (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references sdm.profiles (id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  metadata   jsonb not null default '{}'::jsonb,
  ip_hash    text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_prospects_status on sdm.prospects (status);
create index if not exists idx_prospects_postcode on sdm.prospects (postcode);
create index if not exists idx_prospects_region on sdm.prospects (region);
create index if not exists idx_outreach_prospect on sdm.outreach_activities (prospect_id);
create index if not exists idx_locations_status on sdm.practice_locations (status);
create index if not exists idx_locations_slug on sdm.practice_locations (slug);
create index if not exists idx_locations_geo on sdm.practice_locations (latitude, longitude);
create index if not exists idx_enquiries_practice on sdm.enquiries (practice_location_id);
create index if not exists idx_audit_entity on sdm.audit_events (entity, entity_id);

-- ---------------------------------------------------------------------------
-- Privileges (row-level security still applies)
-- ---------------------------------------------------------------------------
grant all on all tables in schema sdm to anon, authenticated, service_role, postgres;
grant all on all sequences in schema sdm to anon, authenticated, service_role, postgres;
grant execute on all functions in schema sdm to anon, authenticated, service_role, postgres;

alter default privileges in schema sdm grant all on tables to anon, authenticated, service_role, postgres;
alter default privileges in schema sdm grant all on sequences to anon, authenticated, service_role, postgres;
alter default privileges in schema sdm grant execute on functions to anon, authenticated, service_role, postgres;


-- ===== migrations\0002_rls.sql =====
-- ============================================================================
-- Row Level Security + helper functions  (schema: sdm)
-- ============================================================================

-- Helper: current user's role
create or replace function sdm.current_role()
returns sdm.sdm_role
language sql
stable
as $$
  select role from sdm.profiles where id = auth.uid()
$$;

-- Helper: is current user a privileged operator
create or replace function sdm.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((select role from sdm.profiles where id = auth.uid()) in ('admin', 'super_admin'), false)
$$;

-- Helper: is current user business development staff
create or replace function sdm.is_bd()
returns boolean
language sql
stable
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


-- ===== seed.sql =====
-- Seed data (development only). Run after 0001_init.sql + 0002_rls.sql.
-- Idempotent-ish: safe to run once.

insert into sdm.treatments (slug, title, category, description, limitations, is_patient_facing)
values
  ('general', 'General Dentistry', 'general',
   'Routine examinations, check-ups, fillings and preventive care to keep your teeth and gums healthy.',
   array['Suitability depends on an individual assessment.', 'Does not guarantee any specific outcome.'], true),
  ('emergency', 'Emergency Dentistry', 'emergency',
   'Urgent care for severe pain, swelling, trauma or uncontrolled bleeding.',
   array['Not a substitute for emergency services (NHS 111 / 999).', 'Availability varies by practice.'], true),
  ('hygiene', 'Hygiene & Cleaning', 'hygiene',
   'Professional scale and polish, stain removal and gum health maintenance.',
   array['Results vary between individuals.'], true),
  ('restorative', 'Restorative Dentistry', 'restorative',
   'Fillings, crowns, bridges and dentures to restore function and appearance.',
   array['Treatment plan depends on clinical assessment.'], true),
  ('cosmetic', 'Cosmetic Dentistry', 'cosmetic',
   'Whitening, veneers and smile makeovers.',
   array['Not suitable for everyone.', 'No guaranteed aesthetic outcome.'], true),
  ('orthodontic', 'Orthodontics', 'orthodontic',
   'Braces and clear aligners to straighten teeth and correct bite.',
   array['Requires a full assessment.', 'Results depend on compliance and biology.'], true),
  ('implants', 'Dental Implants', 'implants',
   'Fixed replacement for missing teeth using titanium posts.',
   array['Not suitable for all patients.', 'Requires adequate bone and health assessment.'], true),
  ('oral_surgery', 'Oral Surgery', 'oral_surgery',
   'Extractions, including wisdom teeth, and minor surgical procedures.',
   array['Risks explained at consultation.'], true),
  ('sedation', 'Sedation Dentistry', 'sedation',
   'Options to help anxious patients relax during treatment.',
   array['Eligibility assessed case by case.'], true)
on conflict (slug) do nothing;


