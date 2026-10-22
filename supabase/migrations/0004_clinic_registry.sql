-- ============================================================================
-- Migration 0004: clinic registry support  (schema: sdm)
-- Adds town/rating columns to practice_locations and a clinic_credentials
-- table for per-portal login management by admins.
-- ============================================================================

alter table sdm.practice_locations
  add column if not exists town         text,
  add column if not exists rating       numeric(2,1) check (rating between 0 and 5),
  add column if not exists rating_count integer not null default 0;

create index if not exists idx_locations_town on sdm.practice_locations (lower(town));

-- ---------------------------------------------------------------------------
-- clinic_credentials: portal login details for each organisation.
-- DEMO NOTE: passwords stored in plaintext so admins can view them from the
-- super-admin console. Replace with an invitation/reset-token flow before
-- real production use.
-- ---------------------------------------------------------------------------
create table if not exists sdm.clinic_credentials (
  organisation_id uuid primary key references sdm.organisations (id) on delete cascade,
  auth_user_id    uuid not null unique references auth.users (id) on delete cascade,
  login_email     citext not null unique,
  login_password  text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table sdm.clinic_credentials enable row level security;

create policy clinic_credentials_admin_all on sdm.clinic_credentials
  for all using (sdm.is_admin()) with check (sdm.is_admin());

-- ---------------------------------------------------------------------------
-- Backfill town from the first address line's trailing town when possible
-- (no-op here; town is populated by the seed script).
-- ---------------------------------------------------------------------------
