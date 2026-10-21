# Scottish Dental Marketplace

Scotland-first dental marketplace — a **private acquisition CRM** and a **public
verified marketplace**, delivered as two integrated products.

- **Public marketplace** — search verified practices by location, treatment,
  NHS/private offering, prices and availability; send an enquiry.
- **Private acquisition CRM** — research, verify and work Scottish practices;
  only operators can see it. No practice is ever publicly listed without
  authorisation, verification and approval.

Built with **Next.js (App Router) API routes + Supabase (Postgres + Auth + RLS +
Storage)**.

> Reference concept: https://www.openwide.clinic — used as a behavioural
> reference only. No visual assets or copyrighted design materials are reused.

---

## 1. Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in values

# 3. Apply the database schema (see §2)
# 4. Run
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Public site URL (use `http://localhost:3000` in dev) |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Publishable/anon key (safe for the browser) |
| `NEXT_PUBLIC_SUPABASE_SCHEMA` | yes | Postgres schema holding app tables (`sdm`) |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Service role key (**never** expose to the browser) |
| `SUPABASE_STORAGE_BUCKET` | yes | Storage bucket for media (`sdm-media`) |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | no | Postcode geocoding / Places |
| `NTFY_TOPIC` / `NTFY_SERVER` / `NTFY_TOKEN` | no | Optional enquiry notifications |

> The previous `justeat` schema/bucket naming has been replaced. All
> application tables live in a dedicated Postgres schema named **`sdm`**, and
> the storage bucket is `sdm-media`.

---

## 2. Database setup

The Supabase CLI is not required. Apply the schema from the Supabase dashboard:

1. Open **Supabase → SQL Editor**.
2. Paste the contents of **`supabase/apply.sql`** and run it.
3. **Expose the schema** (required for the API): Supabase → **Settings → API →
   Exposed schemas**, add **`sdm`** (keep `public` if you use it elsewhere).
   If you manage the project with the Supabase CLI, expose it via the same API
   settings (the value maps to the project's `db-schemas` configuration).

> Without step 3, PostgREST will return `schema sdm does not exist` for every
> data request, even though the tables exist.

`apply.sql` combines, in order:

- `supabase/migrations/0001_init.sql` — creates the `sdm` schema, tables, enums,
  indexes and grants.
- `supabase/migrations/0002_rls.sql` — Row Level Security, helper functions,
  triggers, storage bucket.
- `supabase/seed.sql` — the public treatment directory.

### Core entities (all in schema `sdm`)

| Domain | Tables |
| --- | --- |
| Identity | `profiles`, `organisations`, `organisation_members` |
| Private CRM | `prospects`, `prospect_sources`, `outreach_activities`, `suppressions`, `invitations` |
| Public marketplace | `practice_locations`, `clinicians`, `treatments`, `practice_treatments`, `prices`, `service_availability` |
| Patient | `enquiries`, `bookings` |
| Commercial | `subscriptions`, `payments` |
| Governance | `reviews`, `content_pages`, `audit_events` |

### Security model (RLS)

- `sdm.prospects` (and all CRM tables) are readable/writable **only** by roles
  `business_development`, `admin`, `super_admin`. Anonymous and ordinary
  authenticated users receive nothing.
- `sdm.practice_locations` is publicly readable **only** when
  `status = 'published'`. Draft/pending/suspended records are never exposed.
- `sdm.enquiries` may be inserted by anyone (the patient form) but read only by
  the owning organisation or an admin.
- Privileged roles can only be granted by an existing admin via
  `POST /api/admin/users`.

This satisfies the MVP acceptance criterion: *unapproved imported prospects
cannot appear on any public page, API, sitemap or search index.*

---

## 3. API reference

### Public

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Liveness check |
| GET | `/api/practices` | Search published practices (`q`, `postcode`, `treatment`, `nhs`, `acceptingNewNhs`, `page`, `pageSize`) |
| GET | `/api/practices/[slug]` | Published practice profile |
| GET | `/api/treatments` | Treatment directory |
| GET | `/api/treatments/[slug]` | Treatment detail |
| POST | `/api/enquiries` | Submit a patient enquiry (clearly marked **not a confirmed booking**) |

### Auth

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create account (`patient` / `practice_owner` / `practice_member`) |
| POST | `/api/auth/signin` | Sign in |
| POST | `/api/auth/signout` | Sign out |
| GET | `/api/auth/session` | Current session + profile |

### Practice dashboard

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/locations` | Create a location (draft) |
| GET | `/api/locations/mine` | Own locations |
| GET/PATCH/DELETE | `/api/locations/[id]` | Manage a location |
| GET/PATCH | `/api/enquiries`, `/api/enquiries/[id]` | Enquiry inbox + status |
| GET | `/api/dashboard/stats` | Organisation analytics |

### Admin / CRM

| Method | Route | Description |
| --- | --- | --- |
| GET/POST | `/api/admin/prospects` | List / create prospects |
| GET/PATCH/DELETE | `/api/admin/prospects/[id]` | Prospect detail, update, archive |
| POST | `/api/admin/outreach` | Log an outreach attempt |
| GET/POST | `/api/admin/invitations` | List / issue expiring invitations |
| POST | `/api/admin/approvals` | Approve / reject / request changes for a listing |
| GET | `/api/admin/locations` | All locations incl. non-published |
| POST | `/api/admin/suppressions` | Add to do-not-contact list |
| POST | `/api/admin/users` | Assign platform role |
| GET | `/api/admin/audit` | Audit trail |

---

## 4. Roles & permissions

| Role | Capabilities |
| --- | --- |
| `patient` | Search, filter, compare, enquire; patient portal |
| `practice_owner` | Manage locations, prices, staff, enquiries, billing |
| `practice_member` | Respond to enquiries and manage permitted content |
| `business_development` | Research/verify private prospects; log outreach |
| `admin` | Approve/suspend listings, govern data, subscriptions, moderation |
| `super_admin` | Access controls, audit, system settings |

Roles are stored on `sdm.profiles.role` and enforced by both RLS and API guards.

---

## 5. Non-negotiable principles (implemented)

- **No automatic public population** — imported/researched practices stay in the
  private CRM.
- **Consent & verification** — a public profile exists only after enrolment +
  admin approval.
- **Truthful information** — prices, services, NHS acceptance, credentials and
  availability are confirmed and dated.
- **Clear booking status** — enquiries are always labelled *"an appointment
  request, not a confirmed booking."*
- **Separation of systems** — CRM and live marketplace have distinct
  permissions and publishing controls.
- **Compliance by design** — privacy, marketing, cyber security, clinical
  advertising and accessibility considered from the start.

---

## 6. Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint (core web vitals) |
| `npm run typecheck` | TypeScript check |

---

## 7. Status & next steps

Implemented (MVP foundation): private CRM, invite workflow, verification and
approval, public search, approved practice profiles, enquiry forms, practice
dashboard, admin console, basic analytics.

Later stages (not yet built): billing/subscriptions, optional reviews, manual
appointment availability, real-time practice-management integrations,
multi-site features, UK expansion.
