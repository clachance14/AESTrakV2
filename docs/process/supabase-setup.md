# Supabase Setup Guide

_Last updated: 2024-07-18_

Use this guide to provision and configure the shared Supabase project for AESTrak v2.

## 1. Create / Link Project

1. Sign in to Supabase and create a new project named **AESTrak v2** (or equivalent stage name).
2. Choose the appropriate organization and region (default: `us-east-1`).
3. Record the project reference (`xyzabc`) — this populates `SUPABASE_PROJECT_REF`.
4. Store generated keys (anon + service role) in the team password manager.

## 2. Configure Database & RLS

- Enable Row Level Security (RLS) globally via project settings (`Project Settings → Database → RLS`). Supabase enables RLS by default; verify it remains on.
- For each tenant-scoped table, create policies that restrict access to members of the same organization (see `docs/architecture/data-dictionary.md`).
- Document every new policy alongside the migration that introduces it.

## 3. Environment Variables

Populate `.env.local` or platform secrets with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET` (from settings → Auth → Settings)
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_URL` (from Project Settings → Database → Connection string → pooled URL)
- `SUPABASE_ACCESS_TOKEN` (personal access token for CLI operations; keep local only)
- Optional overrides:
  - `SUPABASE_SCHEMA` (defaults to `public`)
  - `SUPABASE_TYPES_OUTPUT_PATH` (defaults to `src/types/database.ts`)

## 4. CLI Setup

1. Install CLI: `npm install -g supabase` or `brew install supabase/tap/supabase`.
2. Authenticate: `supabase login` (provide personal access token).
3. Link project locally: `supabase link --project-ref $SUPABASE_PROJECT_REF`.
4. Run migrations (once defined): `npm run db:migrate`.
5. Generate types: `npm run db:generate-types` (uses `scripts/db-generate-types.sh`).

## 5. Local Branches & Environments

- For experimental schema work, create Supabase development branches: `supabase branch create feature-x`.
- Update `.env.local` with branch-specific URLs/keys when testing isolates.
- After merge, regenerate types and update `docs/architecture/data-dictionary.md` with new fields.

## 6. Secrets Management

- Store service role keys and database URLs in secure vaults; never commit them.
- Rotate keys on a regular cadence (quarterly) or after personnel changes.
- Update `.env.example` when new variables are required; describe them in onboarding.

## 7. Verification Checklist

- [ ] RLS enabled globally.
- [ ] Policies created for `purchase_orders`, `quantity_surveys`, `alerts`, `import_jobs`, `audit_logs`, `organization_members`.
- [ ] Service role key tested against server functions only.
- [ ] `npm run db:generate-types` produces a non-empty `src/types/database.ts`.
- [ ] Data dictionary updated to reflect live schema.
