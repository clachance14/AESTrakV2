# Testing Checklist

_Last updated: 2024-07-18_

Use this checklist before submitting a PR or promoting a build to higher environments.

## Automated Checks

- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run test`
- [ ] Coverage review (aim ≥80% on business logic modules)
- [ ] Regenerate Supabase types if migrations changed (`npm run db:generate-types`)

## Feature-Specific Testing

- [ ] Dashboard: load default view, apply filters, confirm KPI accuracy for seeded data.
- [ ] Imports: upload sample PO/QS files, validate error handling, ensure import job status updates.
- [ ] Alerts: trigger utilization thresholds (via fixtures or mock data) and verify acknowledgment flow + audit logs.
- [ ] Purchase Orders: confirm list filters, detail drill-down, and export (if touched).
- [ ] Quantity Surveys: filter by date/vendor, verify detail page context and import provenance.
- [ ] Settings: test invite flow (admin), role changes, profile updates, and billing placeholder messaging.

## Accessibility & UX

- [ ] Keyboard navigation through forms, tables, modals.
- [ ] Screen reader announcements for toasts/alerts.
- [ ] Responsive layout check on key pages (dashboard, imports, alerts).

## Data & Integrity

- [ ] RLS policies exercised via Supabase tests or manual queries (ensure no data leakage across orgs).
- [ ] Audit logs recorded for critical actions (imports, alert acknowledgments, role changes).
- [ ] Background jobs (import processing, alert evaluation) complete without errors in logs.

## Documentation & Communication

- [ ] Updated relevant docs (feature brief, data dictionary, site map) if behavior or schema changed.
- [ ] Added release note entry or TODO for next deployment summary.
- [ ] Mention manual test steps and screenshots in PR description when UI changes.

## Post-Production Considerations

- [ ] For billing updates, ensure manual playbook steps remain accurate until Stripe automation ships.
- [ ] Verify feature flags default states (especially around post-production functionality).
