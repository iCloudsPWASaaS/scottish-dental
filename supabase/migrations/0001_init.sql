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
