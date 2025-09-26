# Engineering Onboarding Guide

_Last updated: 2024-07-18_

## Purpose

Help new contributors reach “first PR” quickly with a consistent environment setup and shared expectations.

## Prerequisites

- Node.js 20.x (align with `.nvmrc` if present).
- npm 10.x (bundled with Node 20) or pnpm if the team standardizes later.
- Git, GitHub access, and write permissions to the repository.
- Supabase CLI installed (`npm install -g supabase` or homebrew).
- Access to shared credentials (Resend API key, Supabase service role) stored in 1Password/secret manager.

## Setup Steps

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd AESTrak
   npm install
   ```
2. **Environment variables**
   - Copy `.env.example` to `.env.local`.
   - Populate required fields: `NEXT_PUBLIC_APP_URL`, Supabase URL/anon key, service role key, JWT secret, project ref, DB URL (pooled), Resend API key.
   - Optional: set `SUPABASE_ACCESS_TOKEN` locally for CLI actions and analytics IDs for Vercel.
   - Post-production: add Stripe secrets when billing automation launches.
3. **Supabase local resources**
   - Log in: `supabase login` (use personal access token).
   - Link project: `supabase link --project-ref <ref>` (dev branch if using).
   - Pull latest migrations: `npm run db:migrate` (ensures schema parity).
4. **Generate types**
   - Run `npm run db:generate-types` to sync `src/types/database.ts` with Supabase schema.
5. **Verify tooling**
   - `npm run lint`
   - `npm run type-check`
   - `npm run test`
   - Optional: `npm run dev` to boot the app locally (Turbopack).

## Branching & Workflow

- Create feature branches off `main` using convention `feature/<name>` or `fix/<issue-id>`.
- Keep branches short-lived; rebase on `main` before opening PRs.
- PRs must include:
  - Summary of changes.
  - Linked issue/ticket.
  - Verification steps (commands run, screenshots if UI changes).
  - Note updates to documentation (link to files under `docs/`).

## Supabase Branch Strategy

- Use Supabase development branches for risky schema work.
- Create branch: `supabase branch create <name>` (or via CLI instructions).
- After testing, merge branch via Supabase dashboard or CLI.
- Always document new RLS policies in PR descriptions.

## Testing Expectations

- Unit/component tests with Vitest and Testing Library; target ≥80% statement coverage for business logic.
- Integration tests around imports, alert evaluation, and billing flow stubs.
- Performance tests for import pipeline when touching relevant modules.

## Documentation Touchpoints

- Update feature briefs when altering major functionality (`docs/product/feature-briefs/`).
- Adjust `docs/architecture/data-dictionary.md` after schema changes.
- Record major decisions in `docs/decisions/` (ADR format).

## Help & Support

- Engineering contact: use the shared support email or phone number for quick questions.
- Weekly sync covers roadmap updates and doc reviews.
- Escalate access or environment issues to the repo owner (listed in PRD Document Control).
