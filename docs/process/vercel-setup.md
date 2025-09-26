# Vercel Setup Guide

_Last updated: 2024-07-18_

Use this checklist to configure Vercel deployments for AESTrak v2.

## 1. Project Creation

1. Log into Vercel with the shared team account.
2. Import the GitHub repository (select the correct organization).
3. Name the project **aest-track** (or environment-specific name).
4. Choose the default framework preset (Next.js 15) — Vercel auto-detects settings.

## 2. Environment Variables

Add the following environment variables for each environment (Preview, Production):

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Server only)
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_URL`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` (optional; remove if not used)

When Stripe automation launches, add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and any additional product IDs.

## 3. Build Settings

- Build command: `npm run build`
- Install command: `npm install`
- Output directory: `.vercel/output` (default for Next.js)
- Enable Turbopack in preview builds if desired (set via Project Settings → General → Turbopack).

## 4. Git Integrations

- Enforce preview deployments for every pull request.
- Protect `main` branch with required status checks (lint, type-check, test from CI pipeline).
- Optionally enable automatic production deployment on merge; require manual promotion initially if desired.

## 5. Monitoring & Logs

- Enable Vercel Analytics for performance metrics if used (set environment variable accordingly).
- Configure log drains or integrate with monitoring tooling (post-MVP).

## 6. Verification Checklist

- [ ] Project linked to GitHub repo.
- [ ] Environment variables populated for Preview and Production.
- [ ] Build succeeds on first deployment.
- [ ] Preview deployments enabled for PRs.
- [ ] Required status checks configured in GitHub.

Store credentials and environment variable values in the shared secret manager; never commit them.
