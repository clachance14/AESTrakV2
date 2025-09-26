# ADR-001: Billing Strategy for MVP

- **Status**: Accepted
- **Date**: 2024-07-18
- **Owners**: Product & Engineering

## Context

Stripe subscription automation is planned but not required for MVP. Implementing full billing flows now would delay launch and add operational complexity before core product validation.

## Decision

- Ship MVP without live Stripe integration.
- Provide manual billing instructions and placeholders in the UI (`/settings/billing`).
- Maintain `subscriptions` table schema for future automation but do not rely on data until Stripe goes live.
- Document manual billing playbook and update admins on procedures.

## Consequences

- Manual effort required to manage plans, invoices, and seat counts pre-launch.
- Need to ensure audit trails capture manual updates to billing-related fields.
- When Stripe integration becomes priority, we have schema and UI hooks ready, reducing refactor cost.

## Follow-up Actions

- Track manual billing actions using `docs/playbooks/manual-billing.md`.
- Create backlog epic for Stripe automation post-production, including webhook handlers and customer portal integration.
- Update docs and ADR status once automation is implemented.
