# Feature Brief: Quantity Surveys

_Last updated: 2024-07-18_

## Purpose

- Provide visibility into individual QS records, their contribution to PO spend, and validation state to support reconciliation (supports PRD §5.3 and §7.3).

## User Story Snapshot

- **Primary user**: Member
- **Core job**: Inspect QS entries, confirm billing amounts, and trace them back to imports and alerts.
- **Definition of Done**: Users can filter QS records, investigate details quickly, and understand their impact on PO utilization.

## Scope & Key Scenarios

- List view with filters (PO, vendor, date range, invoice status) and quick search by QS number.
- Detail panel showing amounts, dates, invoice metadata, and link to originating import job.
- Surface validation flags (duplicates, missing PO) from the import pipeline.
- Support export of filtered QS list (roadmap once PO export solid).

## Routes & Components

- Routes: `/quantity-surveys`, `/quantity-surveys/[qsId]`
- Components: `src/features/quantity-surveys/*`, shared table, filter controls, status badges.
- States: empty (prompt to import QS), loading, error, zero-results after filter.

## Data & Integrations

- Tables: `quantity_surveys`, `purchase_orders`, `import_jobs`, `alerts` (for cross references).
- Background jobs: Import pipeline populates records and flags duplicates; updates cascaded to PO utilization.
- Feature flags: Core feature across all tiers.

## Analytics & Alerts

- Events: `qs.list.viewed`, `qs.filter.updated`, `qs.detail.viewed`.
- Alerts: QS detail shows related alert if utilization threshold triggered for its PO.

## Testing

- Unit tests: filter predicates, duplication flag display, detail component rendering.
- Integration tests: load QS list with fixture data, apply date/vendor filters, navigate to detail, verify import job link.
- Fixtures: QS dataset referencing sample POs in `tests/fixtures/quantity-surveys.json` (to create).

## Open Items / Follow-ups

- Confirm invoice status taxonomy (if additional states needed).
- Decide whether inline editing is allowed or locked to imports.
- Establish retention policy for historical QS records vs archival.
