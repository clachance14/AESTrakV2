# Feature Brief: Settings

_Last updated: 2024-07-18_

## Purpose

- Centralize account management tasks including profile updates, organization membership, and billing placeholders before Stripe automation (supports PRD §5.1 and §7.1, §7.7).

## User Story Snapshot

- **Primary user**: Admin (with shared profile settings for members)
- **Core job**: Manage team access, update personal preferences, and review billing information.
- **Definition of Done**: Admins can invite/manage users and view billing guidance; all users can adjust profile preferences.

## Scope & Key Scenarios

- Profile tab: update display name, timezone, MFA preference, notification settings.
- Organization tab (admin-only): view members, invite new users, deactivate accounts.
- Billing tab (admin-only): present manual billing instructions pre-Stripe, show plan tier and seat usage, display “coming soon” Stripe portal section.

## Current Implementation Snapshot (Phase 1)

- `/settings/profile` supports editing display name, optional phone, and timezone (persisted to `user_profiles` and Supabase auth metadata).
- `/settings/organization` is live with invite form, member roster table, and removal flows backed by Supabase `organization_members` and `audit_logs`.
- `/settings/billing` shows current plan info and manual invoicing instructions while Stripe portal remains disabled.
- Admin-only access enforcement ships via middleware + server-side guard; non-admins are redirected to `/settings/profile`.
- Invite flow sends Supabase transactional email and records `invite_sent` + `member_removed` actions in `audit_logs`.
- Profile and billing tabs remain as placeholders; follow-up tasks will flesh out profile editing UI and manual billing content.

## Routes & Components

- Routes: `/settings/profile`, `/settings/organization`, `/settings/billing`
- Components: `src/features/organizations/*`, `src/features/auth/*` (profile), `src/features/billing/*` (placeholder screens), shared form inputs.
- States: loading forms, validation errors, success toasts, empty member list (beyond admin), gated billing view until Stripe integration.

## Data & Integrations

- Tables: `organization_members`, `organizations`, `user_profiles`, `subscriptions` (post-production), `audit_logs`.
- Background jobs: Invitation emails triggered via Resend; audit logging captures invitations and removals.
- Feature flags: Billing tab gated behind post-production flag; show manual instructions until automation ships.

## Analytics & Alerts

- Events: `settings.profile.updated`, `settings.invite.sent`, `settings.member.removed`, `settings.billing.viewed`.
- Emails: Invite emails via Resend; optional admin notifications for seat limit approaches.

## Testing

- Unit tests: profile form validation helpers, invite/removal flows, billing placeholder message states.
- Integration tests: invite flow (mock Supabase + email), update profile and confirm persisted data, ensure members cannot access admin-only routes.
- Fixtures: mock member list and invitation payloads under `tests/fixtures/settings.json` (to create).

## Open Items / Follow-ups

- Decide MFA enforcement policy per tier and error handling for non-compliant users.
- Define seat limit warnings (when `seats_used` >= `seats_allocated`).
- Finalize content for manual billing instructions and future Stripe portal toggle.
