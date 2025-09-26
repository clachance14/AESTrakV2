# Feature Brief: Dashboard

_Last updated: 2024-07-18_

## Purpose

- Provide a consolidated view of PO utilization, risks, and key metrics so admins and members can spot issues quickly (supports PRD §5.4 and goals in §2.2).

## User Story Snapshot

- **Primary user**: Member (admins share the same view)
- **Core job**: Monitor purchase order utilization and respond to emerging risks.
- **Definition of Done**: User lands on dashboard, sees current utilization cards, risk distribution, and can filter without errors under 3 seconds.

## Scope & Key Scenarios

- Load dashboard with organization defaults, saved filters, and KPI cards.
- Filter by project/vendor/time range to refine charts and tables.
- Handle empty state (no data yet) with setup guidance.
- Show alert badges and link to alert queue.

## Routes & Components

- Routes: `/dashboard`
- Components: `src/features/dashboard/*`, shared UI cards/charts in `src/components/ui/`
- States: loading shimmer, empty checklist, error banner with retry CTA.

## Data & Integrations

- Data: aggregated views on `purchase_orders`, `quantity_surveys`, derived utilization metrics.
- Background jobs: none directly (relies on import + alert pipelines).
- Feature flags: tier gating for advanced analytics (Growth+), fallback cards for Essential tier.

## Analytics & Alerts

- Events: `dashboard.viewed`, `dashboard.filter.updated`, `dashboard.card.clicked` (for drill-down).
- Alerts: display counts from `alerts` table; no email triggers originate here.

## Testing

- Unit tests: utilization aggregation helpers, filter logic, stateful components.
- Integration tests: load dashboard with seeded data, simulate filter changes, verify API query performance.
- Fixtures: sample PO/QS datasets in `/tests/fixtures/dashboard.json` (to create).

## Open Items / Follow-ups

- Decide charting library (Recharts vs Chart.js) to finalize component API.
- Confirm saved filter persistence strategy (Supabase table vs local storage).
- Validate caching approach (ISR vs server actions) for <3s load target.
