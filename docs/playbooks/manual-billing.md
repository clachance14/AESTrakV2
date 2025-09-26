# Playbook: Manual Billing (Pre-Stripe)

_Last updated: 2024-07-18_

Until automated Stripe integration launches, follow this playbook to manage subscriptions and seat counts manually.

## Scope

- Applies to all tiers (Essential, Growth, Enterprise) during MVP phase.
- Admins are responsible for executing steps; record actions in `audit_logs` via admin UI or manual entries.

## Billing Workflow

1. **Plan Selection / Upgrade**
   - Confirm requested tier with customer success.
   - Update `organizations.plan` manually via Supabase dashboard or SQL migration.
   - Adjust seat allocation in `subscriptions` table once available; for now maintain spreadsheet tracker.
   - Notify customer via email template stored in shared drive.
2. **Invoice & Payment**
   - Generate invoice using accounting system (QuickBooks / NetSuite placeholder).
   - Send invoice to customer contact; set reminder cadence (7/14 day follow-up).
   - Mark payment status in internal tracker; update `subscriptions.status` when table exists.
3. **Seat Management**
   - Monitor active members (`organization_members.status = 'active'`).
   - If seat limit exceeded, coordinate with admin to deactivate users or upsell additional seats.
4. **Cancellation / Downgrade**
   - Confirm effective date and prorated refund policy.
   - Update `organizations.plan` and remove expanded features (feature flags) immediately after confirmation.
   - Archive related manual billing records.

## Communication Templates

- Store standardized email templates (upgrade confirmation, payment received, suspension warning) in shared documentation or CRM; link to location here once finalized.

## Audit & Logging

- Record key changes in `audit_logs` via admin tooling where possible.
- For manual updates (SQL), insert audit entries including acting admin, timestamp, context `{"reason": "manual billing"}`.

## Future Migration to Stripe

- Keep manual records structured so they can be migrated into Stripe when automation launches (customer IDs, plan start dates, seat counts).
- Update this playbook once `docs/decisions/ADR-001-billing-strategy.md` is superseded.
