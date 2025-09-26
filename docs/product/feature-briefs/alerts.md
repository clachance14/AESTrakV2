# Feature Brief: Alerts

_Last updated: 2024-07-18_

## Purpose

- Provide proactive visibility into PO utilization risk and allow admins/members to acknowledge and resolve alerts (supports PRD §5.4 and §7.6).

## User Story Snapshot

- **Primary user**: Member (admins share responsibilities)
- **Core job**: Review budget risk alerts, acknowledge actions, and coordinate follow-up.
- **Definition of Done**: Alert queue reflects current utilization thresholds, users can filter and acknowledge alerts, and updates sync to audit logs and email notifications.

## Scope & Key Scenarios

- Display alert list with filters (level, status, vendor, project) and sorting.
- Acknowledge or resolve alerts with confirmation prompts and audit logging.
- Link to PO/QS detail views for context.
- Show alert counts on dashboard cards.

## Routes & Components

- Routes: `/alerts`, `/alerts/[alertId]`
- Components: `src/features/alerts/*`, shared table/list components in `src/components/ui/`
- States: empty (no active alerts), loading spinner, error fallback, acknowledgment success toast.

## Data & Integrations

- Tables: `alerts`, `purchase_orders`, `audit_logs` (for action history).
- Background jobs: Alert evaluation runs post-import to insert/update alert records.
- Feature flags: baseline feature for all tiers; optional SMS notifications gated for future phases.

## Analytics & Alerts

- Events: `alert.viewed`, `alert.filter.updated`, `alert.acknowledged`, `alert.resolved`.
- Email integration: Resend dispatch triggered when alert level escalates; store message metadata for troubleshooting.

## Testing

- Unit tests: alert level calculation helpers, reducers for filter state, acknowledgment components.
- Integration tests: load alert list with seeded data, update status, verify audit log entry and email dispatch mock.
- Fixtures: sample alerts dataset referencing PO IDs under `tests/fixtures/alerts.json` (to create).

## Open Items / Follow-ups

- Determine pagination strategy for large alert queues (infinite scroll vs pagination).
- Finalize email template content and localization approach.
- Decide on SLA for alert acknowledgment (for future workflow automation).
