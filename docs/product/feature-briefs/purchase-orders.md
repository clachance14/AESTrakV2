# Feature Brief: Purchase Orders

_Last updated: 2024-07-18_

## Purpose

- Manage PO records, utilization metrics, and detailed visibility so teams can track spending against authorization limits (supports PRD §5.2 and §7.2).

## User Story Snapshot

- **Primary user**: Member (admins handle initial imports but share the same UI)
- **Core job**: Review PO budgets, filter by relevant attributes, and drill into utilization details.
- **Definition of Done**: Users can locate POs quickly, view accurate utilization stats, and access related QS entries/alerts without latency issues.

## Scope & Key Scenarios

- List view with search, filters (status, vendor, coordinator, utilization band), and pagination.
- Detail view showing utilization trend, remaining budget, linked QS list, and active alerts.
- Export filtered PO list to Excel.
- Support quick navigation from dashboard cards or alerts.

## Routes & Components

- Routes: `/purchase-orders`, `/purchase-orders/[poId]`
- Components: `src/features/purchase-orders/*`, shared table, filter bar, utilization badge components.
- States: empty (prompt to import POs), loading skeleton, error state, zero-results after filtering.

## Data & Integrations

- Tables: `purchase_orders`, `quantity_surveys`, `alerts`, `audit_logs` (for edits), optional view for utilization aggregates.
- Background jobs: Utilization recalculations triggered by imports or manual adjustments.
- Feature flags: Advanced analytics widgets (trend charts) may require Growth/Enterprise tier.

## Analytics & Alerts

- Events: `po.list.viewed`, `po.filter.updated`, `po.detail.viewed`, `po.export.triggered`.
- Alerts: Show active alert badges and deep link to `/alerts/[alertId]` for follow-up.

## Testing

- Unit tests: filter logic, utilization badge thresholds, PO detail components.
- Integration tests: fetch list with mocked Supabase, apply filters/sorts, load detail view with linked QS/alert data.
- Fixtures: sample PO dataset with varying utilization in `tests/fixtures/purchase-orders.json` (to create).

## Open Items / Follow-ups

- Decide charting approach for utilization history (sparkline vs full chart).
- Determine edit capabilities (if any) and associated RLS checks.
- Define export limits and throttling for large datasets.
